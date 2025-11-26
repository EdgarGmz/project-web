const db = require('../database/models');
const { Report, Branch, Sale, Product, Inventory, SaleItem, Customer, User, Purchase, Return } = db;
const { Op } = require('sequelize');

// Generar reporte dinámico
const generateDynamicReport = async (type, startDate, endDate, branch_id) => {
  const whereClause = {};
  
  if (startDate && endDate) {
    // Ajustar las fechas para incluir todo el día
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    whereClause.created_at = {
      [Op.between]: [start, end]
    };
  }
  
  if (branch_id) {
    whereClause.branch_id = branch_id;
  }

  switch (type) {
    case 'sales':
      return await generateSalesReport(whereClause);
    case 'inventory':
      return await generateInventoryReport(branch_id);
    case 'products':
      return await generateProductsReport(whereClause);
    case 'customers':
      return await generateCustomersReport(whereClause);
    case 'financial':
      return await generateFinancialReport(whereClause);
    case 'returns':
      return await generateReturnsReport(whereClause);
    default:
      return null;
  }
};

// Reporte de ventas
const generateSalesReport = async (whereClause) => {
  const sales = await Sale.findAll({
    where: whereClause,
    include: [
      { model: SaleItem, as: 'items' },
      { model: Customer, as: 'customer' },
      { model: Branch, as: 'branch' },
      { model: User, as: 'user' }
    ]
  });

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
  const totalItems = sales.reduce((sum, sale) => sum + (sale.SaleItems?.length || 0), 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Ventas por día
  const salesByDate = {};
  sales.forEach(sale => {
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { date, total: 0, count: 0 };
    }
    salesByDate[date].total += parseFloat(sale.total_amount || 0);
    salesByDate[date].count += 1;
  });
  const dailySales = Object.values(salesByDate);

  // Ventas por método de pago
  const paymentMethods = {};
  sales.forEach(sale => {
    const method = sale.payment_method || 'unknown';
    if (!paymentMethods[method]) {
      paymentMethods[method] = { method, total: 0, count: 0 };
    }
    paymentMethods[method].total += parseFloat(sale.total_amount || 0);
    paymentMethods[method].count += 1;
  });

  // Productos más vendidos
  const productSales = {};
  sales.forEach(sale => {
    sale.SaleItems?.forEach(item => {
      const productId = item.product_id;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += parseFloat(item.unit_price) * item.quantity;
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalSales,
    totalRevenue: totalRevenue.toFixed(2),
    averageTicket: averageTicket.toFixed(2),
    totalItems,
    dailySales,
    paymentMethods: Object.values(paymentMethods),
    topProducts
  };
};

// Reporte de inventario
const generateInventoryReport = async (branch_id) => {
  const whereClause = branch_id ? { branch_id } : {};
  
  const inventory = await Inventory.findAll({
    where: whereClause,
    include: [
      { model: Product, as: 'product' },
      { model: Branch, as: 'branch' }
    ]
  });

  const totalProducts = inventory.length;
  const inventoryValue = inventory.reduce((sum, item) => 
    sum + (parseFloat(item.average_cost || 0) * parseFloat(item.stock_current || 0)), 0
  );
  
  const lowStockItems = inventory.filter(item => 
    item.stock_current <= (item.Product?.min_stock || 10)
  ).length;
  
  const outOfStockItems = inventory.filter(item => 
    item.stock_current <= 0
  ).length;

  const criticalStock = inventory
    .filter(item => item.stock_current <= (item.Product?.min_stock || 10))
    .map(item => ({
      name: item.Product?.name,
      stock: item.stock_current,
      min_stock: item.Product?.min_stock || 10,
      cost: item.average_cost
    }))
    .slice(0, 20);

  // Mapeo para frontend: productsList (todos los productos)
  const productsList = inventory.map(item => {
    let status = 'Normal';
    if (item.stock_current <= 0) status = 'Agotado';
    else if (item.stock_current <= (item.product?.min_stock || 10)) status = 'Crítico';
    return {
      name: item.product?.name || 'Sin nombre',
      branch: item.branch?.name || 'Sin sucursal',
      stock: item.stock_current,
      min_stock: item.product?.min_stock || 10,
      cost: item.average_cost,
      status
    };
  });

  return {
    totalProducts,
    inventoryValue: inventoryValue.toFixed(2),
    lowStockItems,
    outOfStockItems,
    criticalStock,
    productsList
  };
};

// Reporte de productos
const generateProductsReport = async (whereClause) => {
  // Obtener todos los productos
  const products = await Product.findAll({
    include: [
      { model: Inventory, as: 'inventories' }
    ]
  });

  // Obtener ventas del periodo para análisis
  const sales = await Sale.findAll({
    where: whereClause,
    include: [
      { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] }
    ]
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = totalProducts - activeProducts;

  // Calcular ventas por producto
  const productSales = {};
  sales.forEach(sale => {
    sale.SaleItems?.forEach(item => {
      const productId = item.product_id;
      if (!productSales[productId]) {
        productSales[productId] = {
          product_id: productId,
          name: item.Product?.name || 'Sin nombre',
          sku: item.Product?.sku || '',
          quantitySold: 0,
          revenue: 0
        };
      }
      productSales[productId].quantitySold += parseInt(item.quantity || 0);
      productSales[productId].revenue += parseFloat(item.subtotal || 0);
    });
  });

  // Top productos por ventas
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(p => ({
      ...p,
      revenue: p.revenue.toFixed(2)
    }));

  // Productos con bajo stock
  const lowStockProducts = products
    .filter(p => {
      const totalStock = p.Inventories?.reduce((sum, inv) => sum + (inv.stock_current || 0), 0) || 0;
      return totalStock <= (p.min_stock || 10);
    })
    .length;

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    lowStockProducts,
    topProducts,
    totalProductsSold: Object.values(productSales).reduce((sum, p) => sum + p.quantitySold, 0)
  };
};

// Reporte de clientes
const generateCustomersReport = async (whereClause) => {
  // Obtener todos los clientes
  const customers = await Customer.findAll({
    where: whereClause,
    include: [
      { model: Branch, as: 'branches' }
    ]
  });

    // Obtener ventas por cliente
    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer' }
      ]
    });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const inactiveCustomers = totalCustomers - activeCustomers;

    // Calcular ventas por cliente
    const customerSales = {};
    sales.forEach(sale => {
      const customerId = sale.customer_id;
      if (customerId) {
        if (!customerSales[customerId]) {
          customerSales[customerId] = {
            customer_id: customerId,
            totalPurchases: 0,
            totalSpent: 0
          };
        }
        customerSales[customerId].totalPurchases += 1;
        customerSales[customerId].totalSpent += parseFloat(sale.total_amount || 0);
      }
    });

    // Mostrar todos los clientes registrados, aunque no tengan compras
    const allCustomers = customers.map(c => {
      const salesData = customerSales[c.id] || { totalPurchases: 0, totalSpent: 0 };
      return {
        customer_id: c.id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Cliente sin nombre',
        email: c.email || 'Sin email',
        totalPurchases: salesData.totalPurchases,
        totalSpent: salesData.totalSpent.toFixed(2)
      };
    });

    // Top clientes por gasto
    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => {
        const customer = customers.find(cust => cust.id === c.customer_id);
        return {
          customer_id: c.customer_id,
          name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente sin nombre' : 'Cliente desconocido',
          email: customer?.email || 'Sin email',
          totalPurchases: c.totalPurchases,
          totalSpent: c.totalSpent.toFixed(2)
        };
      });

    // Clientes nuevos (registrados en el periodo)
    const newCustomers = customers.length;

    // Calcular promedio de gasto
    const customersWithSales = Object.values(customerSales);
    const averageSpent = customersWithSales.length > 0 
      ? (customersWithSales.reduce((sum, c) => sum + c.totalSpent, 0) / customersWithSales.length).toFixed(2)
      : "0.00";

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      newCustomers,
      customers: allCustomers,
      topCustomers,
      averageSpent
    };
};

// Reporte financiero
const generateFinancialReport = async (whereClause) => {
  // Obtener ventas del periodo
  const sales = await Sale.findAll({
    where: whereClause,
    include: [
      {
        model: SaleItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }
    ]
  });

  // Construir whereClause para purchases usando purchase_date
  const purchaseWhereClause = {};
  if (whereClause.created_at) {
    purchaseWhereClause.purchase_date = whereClause.created_at;
  }
  if (whereClause.branch_id) {
    purchaseWhereClause.branch_id = whereClause.branch_id;
  }

  // Obtener compras del periodo (solo las completadas)
  const purchases = await Purchase.findAll({
    where: {
      ...purchaseWhereClause,
      status: 'completed'
    }
  });

  // Obtener devoluciones aprobadas del periodo
  const returns = await Return.findAll({
    where: {
      ...whereClause,
      status: 'approved'
    },
    include: [
        { model: Product, as: 'product' },
        { model: Customer, as: 'customer' },
      { model: Sale, as: 'sale', include: [{ model: SaleItem, as: 'items' }] }
    ]
  });

  const totalIncome = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
  const totalExpenses = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount || 0), 0);
  
  // Calcular el valor de las devoluciones (basado en los SaleItems originales)
  let totalReturns = 0;
  let totalReturnedItems = 0;
  returns.forEach(returnItem => {
    if (returnItem.Sale && returnItem.Sale.SaleItems) {
      const saleItem = returnItem.Sale.SaleItems.find(item => item.id === returnItem.sale_item_id);
      if (saleItem) {
        totalReturns += parseFloat(saleItem.unit_price) * returnItem.quantity;
        totalReturnedItems += returnItem.quantity;
      }
    }
  });

  const netProfit = totalIncome - totalExpenses - totalReturns;

  // Desglose adicional
  const totalPurchases = purchases.length;
  const averagePurchase = totalPurchases > 0 ? totalExpenses / totalPurchases : 0;
  const totalReturnCount = returns.length;

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    totalReturns: totalReturns.toFixed(2),
    totalReturnCount,
    totalReturnedItems,
    netProfit: netProfit.toFixed(2),
    totalPurchases,
    averagePurchase: averagePurchase.toFixed(2),
    profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : "0.00"
  };
};

// Reporte de devoluciones
const generateReturnsReport = async (whereClause) => {
  // Asegurar que el filtro de fechas se aplique correctamente
  const returns = await Return.findAll({
    where: whereClause,
    include: [
      { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
      { model: Customer, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: db.User, as: 'approvedBy', attributes: ['id', 'first_name', 'last_name'] },
      { model: db.User, as: 'rejectedBy', attributes: ['id', 'first_name', 'last_name'] }
    ],
    order: [['created_at', 'DESC']]
  });

  // Procesar y devolver todas las devoluciones del periodo
  return {
    total: returns.length,
    devoluciones: returns.map(r => ({
      id: r.id,
      status: r.status,
      quantity: r.quantity,
      reason: r.reason,
      rejection_reason: r.rejection_reason,
      product: r.product?.name,
      customer: r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : 'N/A',
      approvedBy: r.ApprovedBy ? `${r.ApprovedBy.first_name} ${r.ApprovedBy.last_name}` : null,
      rejectedBy: r.RejectedBy ? `${r.RejectedBy.first_name} ${r.RejectedBy.last_name}` : null,
      created_at: r.created_at
    }))
  };
  let totalReturnValue = 0;
  let totalReturnedQuantity = 0;
  
  returns.filter(r => r.status === 'approved').forEach(returnItem => {
    if (returnItem.Sale && returnItem.Sale.SaleItems) {
      const saleItem = returnItem.Sale.SaleItems.find(item => item.id === returnItem.sale_item_id);
      if (saleItem) {
        const itemValue = parseFloat(saleItem.unit_price) * returnItem.quantity;
        totalReturnValue += itemValue;
        totalReturnedQuantity += returnItem.quantity;
      }
    }
  });

  // Productos más devueltos
  const productReturns = {};
  returns.forEach(returnItem => {
    const productId = returnItem.product_id;
    const productName = returnItem.Product?.name || 'Desconocido';
    
    if (!productReturns[productId]) {
      productReturns[productId] = {
        productId,
        productName,
        quantity: 0,
        approved: 0,
        rejected: 0,
        pending: 0
      };
    }
    
    productReturns[productId].quantity += returnItem.quantity;
    
    if (returnItem.status === 'approved') productReturns[productId].approved += returnItem.quantity;
    if (returnItem.status === 'rejected') productReturns[productId].rejected += returnItem.quantity;
    if (returnItem.status === 'pending') productReturns[productId].pending += returnItem.quantity;
  });

  const topReturnedProducts = Object.values(productReturns)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Motivos de devolución más comunes
  const reasons = {};
  returns.forEach(returnItem => {
    const reason = returnItem.reason || 'Sin especificar';
    if (!reasons[reason]) {
      reasons[reason] = { reason, count: 0 };
    }
    reasons[reason].count += 1;
  });

  const topReasons = Object.values(reasons)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Devoluciones por día
  const returnsByDate = {};
  returns.forEach(returnItem => {
    const date = new Date(returnItem.created_at).toISOString().split('T')[0];
    if (!returnsByDate[date]) {
      returnsByDate[date] = { date, count: 0, approved: 0, rejected: 0, pending: 0 };
    }
    returnsByDate[date].count += 1;
    if (returnItem.status === 'approved') returnsByDate[date].approved += 1;
    if (returnItem.status === 'rejected') returnsByDate[date].rejected += 1;
    if (returnItem.status === 'pending') returnsByDate[date].pending += 1;
  });
  
  const dailyReturns = Object.values(returnsByDate).sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalReturns,
      approvedReturns,
      rejectedReturns,
      pendingReturns,
      totalReturnValue: totalReturnValue.toFixed(2),
      totalReturnedQuantity,
      averageReturnValue: approvedReturns > 0 ? (totalReturnValue / approvedReturns).toFixed(2) : "0.00",
      approvalRate: totalReturns > 0 ? ((approvedReturns / totalReturns) * 100).toFixed(2) : "0.00",
      rejectionRate: totalReturns > 0 ? ((rejectedReturns / totalReturns) * 100).toFixed(2) : "0.00"
    },
    topReturnedProducts,
    topReasons,
    dailyReturns,
    returns: returns.map(r => ({
      id: r.id,
      status: r.status,
      quantity: r.quantity,
      reason: r.reason,
      rejection_reason: r.rejection_reason,
      product: r.Product?.name,
      customer: r.Customer ? `${r.Customer.first_name} ${r.Customer.last_name}` : 'N/A',
      approvedBy: r.ApprovedBy ? `${r.ApprovedBy.first_name} ${r.ApprovedBy.last_name}` : null,
      rejectedBy: r.RejectedBy ? `${r.RejectedBy.first_name} ${r.RejectedBy.last_name}` : null,
      created_at: r.created_at
    }))
  };
};

// Obtener todos los reportes (ahora genera reportes dinámicos)
const getAllReports = async (req, res) => {
  try {
    const type = req.query.type;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const branch_id = req.query.branch_id;

    // Si hay parámetros de tipo y fechas, generar reporte dinámico
    if (type && startDate && endDate) {
      const reportData = await generateDynamicReport(type, startDate, endDate, branch_id);
      
      return res.json({
        success: true,
        message: 'Reporte generado exitosamente',
        data: reportData
      });
    }

    // Si no, buscar reportes guardados
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (branch_id) whereClause.branch_id = branch_id;

    const { count, rows } = await Report.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['generated_at', 'DESC']],
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Reportes obtenidos exitosamente',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Obtener un reporte por ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id, {
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }]
    });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    res.json({ success: true, message: 'Reporte obtenido exitosamente', data: report });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Crear un nuevo reporte
const createReport = async (req, res) => {
  try {
    const { branch_id, type, title, description, data } = req.body;
    if (!type || !title || !data) {
      return res.status(400).json({ success: false, message: 'Tipo, título y datos son obligatorios' });
    }
    const newReport = await Report.create({ branch_id, type, title, description, data });
    res.status(201).json({ success: true, message: 'Reporte creado exitosamente', data: newReport });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar un reporte
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    await report.update(updateData);
    res.json({ success: true, message: 'Reporte actualizado exitosamente', data: report });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Eliminar un reporte
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    await report.destroy();
    res.json({ success: true, message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
};
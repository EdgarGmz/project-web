const { Sale, SaleItem, Product, Customer, Inventory, Branch, User } = require('../database/models');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const { Sequelize } = require('sequelize');

// Obtener estadísticas generales del dashboard
const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userBranchId = req.user.branch_id;
        
        // Filtro por sucursal si el usuario no es owner o admin
        const isAdminOrOwner = req.user.role === 'owner' || req.user.role === 'admin';
        const branchFilter = isAdminOrOwner ? {} : { branch_id: userBranchId };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        // Ventas de hoy
        const salesToday = await Sale.count({
            where: {
                ...branchFilter,
                created_at: { [Op.gte]: today },
                status: 'completed'
            }
        });

        // Ventas de ayer
        const salesYesterday = await Sale.count({
            where: {
                ...branchFilter,
                created_at: {
                    [Op.gte]: yesterday,
                    [Op.lt]: today
                },
                status: 'completed'
            }
        });

        // Ventas este mes
        const salesThisMonth = await Sale.count({
            where: {
                ...branchFilter,
                created_at: { [Op.gte]: thisMonthStart },
                status: 'completed'
            }
        });

        // Ventas mes pasado
        const salesLastMonth = await Sale.count({
            where: {
                ...branchFilter,
                created_at: {
                    [Op.gte]: lastMonthStart,
                    [Op.lt]: lastMonthEnd
                },
                status: 'completed'
            }
        });

        // Ingresos de hoy
        const revenueToday = await Sale.sum('total_amount', {
            where: {
                ...branchFilter,
                created_at: { [Op.gte]: today },
                status: 'completed'
            }
        }) || 0;

        // Ingresos este mes
        const revenueThisMonth = await Sale.sum('total_amount', {
            where: {
                ...branchFilter,
                created_at: { [Op.gte]: thisMonthStart },
                status: 'completed'
            }
        }) || 0;

        // Ingresos mes pasado
        const revenueLastMonth = await Sale.sum('total_amount', {
            where: {
                ...branchFilter,
                created_at: {
                    [Op.gte]: lastMonthStart,
                    [Op.lt]: lastMonthEnd
                },
                status: 'completed'
            }
        }) || 0;

        // Calcular crecimiento
        const growth = revenueLastMonth > 0 
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
            : 0;

        // Total de productos (productos únicos que tienen inventario en la sucursal)
        let totalProducts;
        if (isAdminOrOwner) {
            // Owner ve todos los productos únicos
            totalProducts = await Product.count({
                distinct: true,
                include: [{
                    model: Inventory,
                    as: 'inventories',
                    required: true
                }]
            });
        } else {
            // Otros roles ven productos de su sucursal
            totalProducts = await Product.count({
                distinct: true,
                include: [{
                    model: Inventory,
                    as: 'inventories',
                    where: { branch_id: userBranchId },
                    required: true
                }]
            });
        }

        // Productos con stock bajo
        const lowStockProducts = await Inventory.count({
            where: {
                ...branchFilter,
                stock_current: {
                    [Op.lte]: Sequelize.col('stock_minimum'),
                    [Op.gt]: 0
                }
            }
        });

        // Productos sin stock
        const outOfStockProducts = await Inventory.count({
            where: {
                ...branchFilter,
                stock_current: 0
            }
        });

        // Total de clientes (clientes asociados a la sucursal)
        let totalCustomers;
        let newCustomers;
        if (isAdminOrOwner) {
            // Owner ve todos los clientes
            totalCustomers = await Customer.count();
            newCustomers = await Customer.count({
                where: {
                    created_at: { [Op.gte]: thisMonthStart }
                }
            });
        } else {
            // Otros roles ven clientes de su sucursal (relación N:N)
            totalCustomers = await Customer.count({
                distinct: true,
                include: [{
                    model: Branch,
                    as: 'branches',
                    where: { id: userBranchId },
                    required: true
                }]
            });
            newCustomers = await Customer.count({
                distinct: true,
                include: [{
                    model: Branch,
                    as: 'branches',
                    where: { id: userBranchId },
                    required: true
                }],
                where: {
                    created_at: { [Op.gte]: thisMonthStart }
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: {
                sales: {
                    today: salesToday,
                    yesterday: salesYesterday,
                    thisMonth: salesThisMonth,
                    lastMonth: salesLastMonth
                },
                revenue: {
                    today: revenueToday,
                    thisMonth: revenueThisMonth,
                    lastMonth: revenueLastMonth,
                    growth: parseFloat(growth)
                },
                products: {
                    total: totalProducts,
                    lowStock: lowStockProducts,
                    outOfStock: outOfStockProducts
                },
                customers: {
                    total: totalCustomers,
                    new: newCustomers
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener ventas recientes
const getRecentSales = async (req, res) => {
    try {
        const userBranchId = req.user.branch_id;
        const isAdminOrOwner = req.user.role === 'owner' || req.user.role === 'admin';
        const branchFilter = isAdminOrOwner ? {} : { branch_id: userBranchId };

        const recentSales = await Sale.findAll({
            where: {
                ...branchFilter,
                status: 'completed'
            },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: SaleItem,
                    as: 'items'
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        const formattedSales = recentSales.map((sale, index) => ({
            id: sale.id,
            sale_number: `${String(recentSales.length - index).padStart(4, '0')}`,
            customer_name: sale.customer 
                ? `${sale.customer.first_name} ${sale.customer.last_name}`
                : 'Cliente general',
            total: sale.total_amount,
            total_items: sale.items?.length || 0,
            payment_method: sale.payment_method,
            created_at: sale.created_at
        }));

        res.status(200).json({
            success: true,
            message: 'Ventas recientes obtenidas exitosamente',
            data: formattedSales
        });
    } catch (error) {
        console.error('Error al obtener ventas recientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener productos más vendidos
const getTopProducts = async (req, res) => {
    try {
        const userBranchId = req.user.branch_id;
        const isAdminOrOwner = req.user.role === 'owner' || req.user.role === 'admin';
        const branchFilter = isAdminOrOwner ? {} : { branch_id: userBranchId };

        const topProducts = await SaleItem.findAll({
            attributes: [
                'product_id',
                [Sequelize.fn('SUM', Sequelize.col('SaleItem.quantity')), 'quantity_sold'],
                [Sequelize.fn('SUM', Sequelize.literal('SaleItem.quantity * SaleItem.unit_price')), 'revenue']
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'sku']
                },
                {
                    model: Sale,
                    as: 'sale',
                    attributes: [],
                    where: branchFilter
                }
            ],
            group: ['product_id', 'product.id'],
            order: [[Sequelize.literal('quantity_sold'), 'DESC']],
            limit: 10,
            raw: false
        });

        const formattedProducts = topProducts.map(item => ({
            name: item.product.name,
            brand: item.product.brand,
            quantity_sold: item.get('quantity_sold'),
            revenue: parseFloat(item.get('revenue')) || 0
        }));

        res.status(200).json({
            success: true,
            message: 'Productos más vendidos obtenidos exitosamente',
            data: formattedProducts
        });
    } catch (error) {
        console.error('Error al obtener productos top:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener productos con stock bajo
const getLowStockProducts = async (req, res) => {
    try {
        const userBranchId = req.user.branch_id;
        const isAdminOrOwner = req.user.role === 'owner' || req.user.role === 'admin';
        const branchFilter = isAdminOrOwner ? {} : { branch_id: userBranchId };

        const lowStockProducts = await Inventory.findAll({
            where: {
                ...branchFilter,
                stock_current: {
                    [Op.lte]: Sequelize.col('stock_minimum')
                }
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'sku']
                }
            ],
            order: [['stock_current', 'ASC']],
            limit: 20
        });

        const formattedProducts = lowStockProducts.map(inv => ({
            name: inv.product.name,
            sku: inv.product.sku,
            stock: inv.stock_current,
            min_stock: inv.stock_minimum
        }));

        res.status(200).json({
            success: true,
            message: 'Productos con stock bajo obtenidos exitosamente',
            data: formattedProducts
        });
    } catch (error) {
        console.error('Error al obtener productos con stock bajo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getStats,
    getRecentSales,
    getTopProducts,
    getLowStockProducts
};

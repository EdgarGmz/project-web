// Funciones de utilidad generales
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount)
}

const generateSKU = (prefix = 'PRD') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

const generateSaleNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getTime()).substr(-6)
    
    return `V${year}${month}${day}-${time}`
}

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

const calculateDiscount = (amount, percentage) => {
    return Math.round((amount * percentage / 100) * 100) / 100
}

module.exports = {
    formatCurrency,
    generateSKU,
    generateSaleNumber,
    validateEmail,
    calculateDiscount
}
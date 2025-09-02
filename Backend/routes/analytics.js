// routes/analytics.js
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Company = require('../models/Company');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// @route   GET /api/analytics/sales
// @desc    Get sales report by period
router.get('/sales', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let startDate = new Date();
    
    // Calculate date range based on period
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
    }).populate('productid', 'price');

    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, order) => 
      sum + (order.productid?.price || 0), 0
    );

    // Group by date for trend analysis
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + 1;
    });

    const trendData = Object.entries(salesByDate).map(([date, count]) => ({
      date,
      sales: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: {
        period,
        totalSales,
        totalRevenue,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        trendData
      }
    });

  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rapport des ventes',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue report for date range
router.get('/revenue', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Dates de début et de fin requises'
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
    }).populate('productid', 'price name');

    const totalRevenue = orders.reduce((sum, order) => 
      sum + (order.productid?.price || 0), 0
    );

    // Group by month for revenue trend
    const revenueByMonth = {};
    orders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const revenue = order.productid?.price || 0;
      revenueByMonth[month] = (revenueByMonth[month] || 0) + revenue;
    });

    const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        revenueData
      }
    });

  } catch (error) {
    console.error('Error fetching revenue report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rapport des revenus',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/top-products
// @desc    Get top selling products
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
        }
      },
      {
        $group: {
          _id: '$productid',
          totalOrders: { $sum: 1 },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          productPrice: '$product.price',
          totalOrders: 1,
          totalRevenue: { $multiply: ['$totalOrders', '$product.price'] },
          lastOrderDate: 1
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });

  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits populaires',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/top-clients
// @desc    Get top clients by order count
router.get('/top-clients', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topClients = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
        }
      },
      {
        $group: {
          _id: '$clientid',
          totalOrders: { $sum: 1 },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'client.company',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $project: {
          clientId: '$_id',
          clientName: '$client.name',
          clientEmail: '$client.email',
          companyName: { $arrayElemAt: ['$company.name', 0] },
          totalOrders: 1,
          lastOrderDate: 1
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.status(200).json({
      success: true,
      data: topClients
    });

  } catch (error) {
    console.error('Error fetching top clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des meilleurs clients',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/growth
// @desc    Get growth metrics (month-over-month)
router.get('/growth', async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month data
    const [currentOrders, currentClients, currentRevenue] = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: currentMonthStart },
        status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
      }),
      Client.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      Order.aggregate([
        {
          $match: { 
            createdAt: { $gte: currentMonthStart },
            status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productid',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$product.price' }
          }
        }
      ])
    ]);

    // Last month data
    const [lastOrders, lastClients, lastRevenue] = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
      }),
      Client.countDocuments({ 
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
      }),
      Order.aggregate([
        {
          $match: { 
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
            status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productid',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$product.price' }
          }
        }
      ])
    ]);

    const currentRevenueTotal = currentRevenue[0]?.total || 0;
    const lastRevenueTotal = lastRevenue[0]?.total || 0;

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.status(200).json({
      success: true,
      data: {
        orders: {
          current: currentOrders,
          previous: lastOrders,
          growth: calculateGrowth(currentOrders, lastOrders)
        },
        clients: {
          current: currentClients,
          previous: lastClients,
          growth: calculateGrowth(currentClients, lastClients)
        },
        revenue: {
          current: currentRevenueTotal,
          previous: lastRevenueTotal,
          growth: calculateGrowth(currentRevenueTotal, lastRevenueTotal)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching growth metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des métriques de croissance',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/conversion
// @desc    Get customer journey conversion funnel metrics
router.get('/conversion', async (req, res) => {
  try {
    // Since we don't have visitor/lead tracking, we'll simulate the customer journey
    // using available data: Companies -> Clients -> Orders
    
    const totalCompanies = await Company.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({
      status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
    });

    // For demo purposes, we'll simulate visitors as companies * 3 (assuming each company has multiple contacts)
    const totalVisitors = totalCompanies * 3;
    const totalLeads = totalCompanies; // Companies are leads in B2B context

    // Calculate conversion rates
    const visitorToLead = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;
    const leadToClient = totalLeads > 0 ? (totalClients / totalLeads) * 100 : 0;
    const clientToOrder = totalClients > 0 ? (totalOrders / totalClients) * 100 : 0;
    const overallConversion = totalVisitors > 0 ? (completedOrders / totalVisitors) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        visitorToLead: Math.round(visitorToLead * 100) / 100,
        leadToClient: Math.round(leadToClient * 100) / 100,
        clientToOrder: Math.round(clientToOrder * 100) / 100,
        overallConversion: Math.round(overallConversion * 100) / 100,
        totalVisitors,
        totalLeads,
        totalClients,
        totalOrders,
        // Additional metrics for debugging
        completedOrders,
        conversionDetails: {
          companies: totalCompanies,
          clients: totalClients,
          orders: totalOrders,
          completedOrders
        }
      }
    });

  } catch (error) {
    console.error('Error fetching conversion metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des taux de conversion',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/monthly-target
// @desc    Get monthly target progress with real business data
router.get('/monthly-target', async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Get current month date range
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Calculate days in month and days passed
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysPassed = today.getDate();
    const progressRatio = daysPassed / daysInMonth;

    // Get current month orders and revenue
    const monthlyOrders = await Order.find({
      createdAt: { $gte: monthStart, $lte: monthEnd },
      status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
    }).populate('productid', 'price');

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => 
      sum + (order.productid?.price || 0), 0
    );

    // Get today's orders and revenue
    const todayOrders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
    }).populate('productid', 'price');

    const todayRevenue = todayOrders.reduce((sum, order) => 
      sum + (order.productid?.price || 0), 0
    );

    // Set realistic monthly targets based on current performance
    // Target should be achievable but challenging
    const projectedMonthlyRevenue = monthlyRevenue / progressRatio;
    const monthlyRevenueTarget = Math.max(projectedMonthlyRevenue * 1.2, 50000); // At least $50K target
    const monthlyOrdersTarget = Math.max(Math.round(monthlyOrders.length / progressRatio * 1.15), 100); // At least 100 orders

    // Calculate progress percentages
    const revenueProgress = monthlyRevenueTarget > 0 
      ? Math.min((monthlyRevenue / monthlyRevenueTarget) * 100, 100) 
      : 0;

    const orderProgress = monthlyOrdersTarget > 0 
      ? Math.min((monthlyOrders.length / monthlyOrdersTarget) * 100, 100) 
      : 0;

    // Overall progress (average of revenue and order progress)
    const overallProgress = Math.round((revenueProgress + orderProgress) / 2);

    // Calculate growth compared to last month
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const lastMonthOrders = await Order.find({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      status: { $in: ['confirmee', 'en_preparation', 'expediee', 'livree'] }
    }).populate('productid', 'price');

    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => 
      sum + (order.productid?.price || 0), 0
    );

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : (monthlyRevenue > 0 ? 100 : 0);

    // Generate motivational message
    const generateMessage = () => {
      if (overallProgress >= 80) {
        return `Excellent progress! You're ${overallProgress}% toward your ${monthName} target. Keep up the outstanding work!`;
      } else if (overallProgress >= 60) {
        return `Good momentum! You've achieved ${overallProgress}% of your ${monthName} target. You're on track for success!`;
      } else if (overallProgress >= 40) {
        return `Steady progress at ${overallProgress}% of your target. Focus on key opportunities to accelerate growth.`;
      } else {
        return `Early in the month with ${overallProgress}% progress. Plenty of time to reach your ${monthName} target!`;
      }
    };

    res.status(200).json({
      success: true,
      data: {
        // Progress metrics
        overallProgress,
        revenueProgress: Math.round(revenueProgress * 100) / 100,
        orderProgress: Math.round(orderProgress * 100) / 100,
        
        // Current performance
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        monthlyOrders: monthlyOrders.length,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        todayOrders: todayOrders.length,
        
        // Targets
        monthlyRevenueTarget: Math.round(monthlyRevenueTarget * 100) / 100,
        monthlyOrdersTarget,
        
        // Growth metrics
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        
        // Time tracking
        monthName,
        daysPassed,
        daysInMonth,
        progressRatio: Math.round(progressRatio * 100) / 100,
        
        // Motivational message
        message: generateMessage(),
        
        // Projections
        projectedRevenue: Math.round(projectedMonthlyRevenue * 100) / 100,
        remainingDays: daysInMonth - daysPassed,
        dailyTargetRevenue: Math.round((monthlyRevenueTarget - monthlyRevenue) / Math.max(daysInMonth - daysPassed, 1) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error fetching monthly target:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des objectifs mensuels',
      error: error.message
    });
  }
});

module.exports = router;

import { Response, NextFunction } from 'express'
import { ReportsService } from './reports.service'
import { AuthRequest } from '../../middleware/auth'
import PDFDocument from 'pdfkit'

export const getDashboardKPIs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kpis = await ReportsService.getDashboardKPIs()
    res.json({
      status: 'success',
      data: kpis,
    })
  } catch (error) {
    next(error)
  }
}

export const getVehicleReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await ReportsService.getVehicleMetrics()
    res.json({
      status: 'success',
      results: metrics.length,
      data: metrics,
    })
  } catch (error) {
    next(error)
  }
}

export const exportCSVReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const csv = await ReportsService.generateCSVReport()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_fleet_report.csv')
    res.status(200).send(csv)
  } catch (error) {
    next(error)
  }
}

export const exportPDFReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await ReportsService.getVehicleMetrics();
    const kpis = await ReportsService.getDashboardKPIs();

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_fleet_report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('TransitOps Fleet Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // KPIs Section
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Key Performance Indicators');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Active Vehicles: ${kpis.activeVehicles}`);
    doc.text(`Active Trips: ${kpis.activeTrips}`);
    doc.text(`Fleet Utilization: ${kpis.fleetUtilization.toFixed(1)}%`);
    doc.text(`Vehicles in Maintenance: ${kpis.vehiclesInMaintenance}`);
    doc.moveDown(2);

    // Table Header
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Vehicle Metrics');
    doc.moveDown(1);
    
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Vehicle (Reg)', 50, tableTop);
    doc.text('Model', 180, tableTop);
    doc.text('Status', 300, tableTop);
    doc.text('Cost', 400, tableTop);
    doc.text('ROI', 500, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    // Table Rows
    let yPosition = tableTop + 25;
    doc.font('Helvetica');
    
    metrics.forEach(vehicle => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.text(vehicle.registrationNumber, 50, yPosition);
      doc.text(vehicle.nameModel.substring(0, 20), 180, yPosition);
      doc.text(vehicle.status.replace(/_/g, ' '), 300, yPosition);
      doc.text(`$${vehicle.totalOperationalCost.toLocaleString()}`, 400, yPosition);
      doc.text(`$${vehicle.roi.toLocaleString()}`, 500, yPosition);
      
      yPosition += 20;
    });

    doc.end();

  } catch (error) {
    next(error);
  }
}

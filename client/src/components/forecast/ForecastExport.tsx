import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Mail } from "lucide-react";

export const ForecastExport = ({
  forecastData,
  todayForecasts,
  accuracy,
  historical,
}: {
  forecastData: any[];
  todayForecasts: any[];
  accuracy: any;
  historical: any;
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Prepare forecast data CSV
      const forecastHeaders = [
        "Date",
        "Day",
        "Demand Estimate",
        "Confidence Lower",
        "Confidence Upper",
        "Linear Forecast",
        "ARIMA Forecast",
      ];
      const forecastRows = forecastData.map((row) => [
        row.date,
        row.day_name,
        row.demand_estimate,
        row.confidence_lower,
        row.confidence_upper,
        row.linear_forecast || "",
        row.arima_forecast || "",
      ]);

      // Prepare today's forecast CSV
      const todayHeaders = [
        "Product Name",
        "SKU",
        "Predicted Demand",
        "Current Stock",
        "Stock Status",
        "Trend",
        "Confidence Score",
        "Avg Daily Demand",
        "Days of Stock",
      ];
      const todayRows = todayForecasts.map((row) => [
        row.name,
        row.sku,
        row.predicted_demand,
        row.current_stock,
        row.stock_status,
        row.trend,
        row.confidence_score,
        row.avg_daily_demand,
        row.days_of_stock,
      ]);

      // Create CSV content
      const csvContent = [
        "FORECAST DATA",
        forecastHeaders.join(","),
        ...forecastRows.map((row) => row.join(",")),
        "",
        "TODAY'S PRODUCT FORECASTS",
        todayHeaders.join(","),
        ...todayRows.map((row) => row.join(",")),
        "",
        "MODEL METRICS",
        `MAE,${accuracy?.mae || 0}`,
        `RMSE,${accuracy?.rmse || 0}`,
        `MAPE,${accuracy?.mape || 0}%`,
        "",
        "HISTORICAL SUMMARY",
        `Total Days,${historical?.total_days || 0}`,
        `Avg Daily Demand,${historical?.avg_daily_demand || 0}`,
        `Max Daily Demand,${historical?.max_daily_demand || 0}`,
        `Total Demand,${historical?.total_demand || 0}`,
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `forecast-report-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);

    try {
      const exportData = {
        generated_at: new Date().toISOString(),
        forecast_data: forecastData,
        today_forecasts: todayForecasts,
        model_metrics: accuracy,
        historical_summary: historical,
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `forecast-report-${new Date().toISOString().split("T")[0]}.json`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareViaEmail = () => {
    const subject = `Supply Chain Forecast Report - ${new Date().toLocaleDateString()}`;
    const body = `
Supply Chain AI Dashboard - Forecast Report

Generated on: ${new Date().toLocaleString()}

Key Metrics:
- Total Forecast Days: ${forecastData.length}
- Products Monitored: ${todayForecasts.length}
- Model Accuracy (MAPE): ${accuracy?.mape || 0}%

Critical Stock Alerts: ${todayForecasts.filter((p) => p.stock_status === "critical").length}

Please find the detailed forecast data attached.

Best regards,
Supply Chain AI Dashboard
    `.trim();

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Download className="text-cyan-500" size={18} />
        <h4 className="font-black uppercase tracking-tighter text-xs text-zinc-500">
          Export_Forecast_Data
        </h4>
      </div>

      <div className="space-y-3">
        {/* CSV Export */}
        <button
          onClick={exportToCSV}
          disabled={isExporting}
          className="w-full p-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl border border-green-500 transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {isExporting ? "Exporting..." : "Export_CSV"}
          </span>
        </button>

        {/* JSON Export */}
        <button
          onClick={exportToJSON}
          disabled={isExporting}
          className="w-full p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl border border-blue-500 transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <FileText size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {isExporting ? "Exporting..." : "Export_JSON"}
          </span>
        </button>

        {/* Email Share */}
        <button
          onClick={shareViaEmail}
          className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl border border-purple-500 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Mail size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Share_Via_Email
          </span>
        </button>

        {/* Export Info */}
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
            Export_Includes:
          </p>
          <div className="space-y-1 text-[9px] text-cyan-600 dark:text-cyan-400">
            <div>• 30-day forecast data</div>
            <div>• Today's product forecasts</div>
            <div>• Model accuracy metrics</div>
            <div>• Historical performance data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

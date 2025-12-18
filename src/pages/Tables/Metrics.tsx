import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import ConfusionMatrices from "../../components/ecommerce/ConfusionMatrices";
import LossEpochsChart from "../../components/ecommerce/LossEpochsChart";
import ApkAnalyzer from "../../components/ecommerce/ApkAnalyzer";

export default function Metrics() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Analyzer Hub"/>
       <div className="grid grid-cols-12 gap-4 md:gap-6">
              {/* <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />
      
                <MonthlySalesChart />
              </div>
      
              <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
              </div>
               <div className="col-span-12">
                <ConfusionMatrices />
              </div>
              <div className="col-span-12">
                <StatisticsChart />
              </div>
              <div className="col-span-12">
                <LossEpochsChart />
              </div> */}
             
              <div className="col-span-12">
          <ApkAnalyzer />
        </div>
      
         
            </div>
    </>
  );
}

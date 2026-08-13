import { Dataset } from '../types';
import { profileDataset } from './profiler';

export const SAMPLE_SAAS_SALES = [
  { OrderID: 'ORD-1001', Date: '2025-01-05', Region: 'North America', Segment: 'Enterprise', Plan: 'Pro Tier', MRR: 2400, Quantity: 5, Satisfaction: 4.8, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1002', Date: '2025-01-08', Region: 'Europe', Segment: 'SMB', Plan: 'Basic Tier', MRR: 450, Quantity: 2, Satisfaction: 3.5, ChurnRisk: 'Medium' },
  { OrderID: 'ORD-1003', Date: '2025-01-12', Region: 'Asia Pacific', Segment: 'Enterprise', Plan: 'Custom Tier', MRR: 5800, Quantity: 12, Satisfaction: 4.9, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1004', Date: '2025-01-15', Region: 'Latin America', Segment: 'Startup', Plan: 'Basic Tier', MRR: 320, Quantity: 1, Satisfaction: 4.2, ChurnRisk: 'High' },
  { OrderID: 'ORD-1005', Date: '2025-01-20', Region: 'North America', Segment: 'SMB', Plan: 'Pro Tier', MRR: 1200, Quantity: 3, Satisfaction: 4.6, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1006', Date: '2025-02-01', Region: 'Europe', Segment: 'Enterprise', Plan: 'Custom Tier', MRR: 7200, Quantity: 15, Satisfaction: 5.0, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1007', Date: '2025-02-05', Region: 'North America', Segment: 'Startup', Plan: 'Pro Tier', MRR: 1500, Quantity: 4, Satisfaction: 3.8, ChurnRisk: 'Medium' },
  { OrderID: 'ORD-1008', Date: '2025-02-10', Region: 'Asia Pacific', Segment: 'SMB', Plan: 'Basic Tier', MRR: 600, Quantity: 2, Satisfaction: 4.1, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1009', Date: '2025-02-14', Region: 'Europe', Segment: 'Startup', Plan: 'Pro Tier', MRR: 1800, Quantity: 4, Satisfaction: 4.4, ChurnRisk: 'Medium' },
  { OrderID: 'ORD-1010', Date: '2025-02-18', Region: 'Latin America', Segment: 'Enterprise', Plan: 'Custom Tier', MRR: 4900, Quantity: 10, Satisfaction: 4.7, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1011', Date: '2025-03-02', Region: 'North America', Segment: 'Enterprise', Plan: 'Pro Tier', MRR: 3100, Quantity: 6, Satisfaction: 4.9, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1012', Date: '2025-03-08', Region: 'Europe', Segment: 'SMB', Plan: 'Pro Tier', MRR: 1400, Quantity: 3, Satisfaction: 4.0, ChurnRisk: 'High' },
  { OrderID: 'ORD-1013', Date: '2025-03-15', Region: 'Asia Pacific', Segment: 'Enterprise', Plan: 'Custom Tier', MRR: 8500, Quantity: 18, Satisfaction: 4.8, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1014', Date: '2025-03-22', Region: 'North America', Segment: 'Startup', Plan: 'Basic Tier', MRR: 500, Quantity: 2, Satisfaction: 3.9, ChurnRisk: 'Medium' },
  { OrderID: 'ORD-1015', Date: '2025-03-28', Region: 'Latin America', Segment: 'SMB', Plan: 'Pro Tier', MRR: 1100, Quantity: 3, Satisfaction: 4.3, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1016', Date: '2025-04-03', Region: 'Europe', Segment: 'Enterprise', Plan: 'Pro Tier', MRR: 2900, Quantity: 6, Satisfaction: 4.5, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1017', Date: '2025-04-10', Region: 'Asia Pacific', Segment: 'Startup', Plan: 'Basic Tier', MRR: 400, Quantity: 1, Satisfaction: 3.7, ChurnRisk: 'High' },
  { OrderID: 'ORD-1018', Date: '2025-04-16', Region: 'North America', Segment: 'SMB', Plan: 'Pro Tier', MRR: 1650, Quantity: 4, Satisfaction: 4.7, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1019', Date: '2025-04-22', Region: 'Europe', Segment: 'Enterprise', Plan: 'Custom Tier', MRR: 9200, Quantity: 20, Satisfaction: 5.0, ChurnRisk: 'Low' },
  { OrderID: 'ORD-1020', Date: '2025-04-29', Region: 'Latin America', Segment: 'Startup', Plan: 'Basic Tier', MRR: 350, Quantity: 1, Satisfaction: 4.0, ChurnRisk: 'Medium' }
];

export const SAMPLE_RETAIL_STORE = [
  { OrderID: 'RE-801', OrderDate: '2025-01-10', Category: 'Furniture', SubCategory: 'Chairs', Sales: 350, Profit: 85, Discount: 0.10, Quantity: 2, ShipMode: 'Express' },
  { OrderID: 'RE-802', OrderDate: '2025-01-14', Category: 'Technology', SubCategory: 'Phones', Sales: 890, Profit: 210, Discount: 0.00, Quantity: 1, ShipMode: 'Standard' },
  { OrderID: 'RE-803', OrderDate: '2025-01-18', Category: 'Office Supplies', SubCategory: 'Paper', Sales: 45, Profit: 18, Discount: 0.05, Quantity: 5, ShipMode: 'Same Day' },
  { OrderID: 'RE-804', OrderDate: '2025-01-25', Category: 'Technology', SubCategory: 'Laptops', Sales: 1450, Profit: 380, Discount: 0.15, Quantity: 1, ShipMode: 'Express' },
  { OrderID: 'RE-805', OrderDate: '2025-02-02', Category: 'Furniture', SubCategory: 'Tables', Sales: 620, Profit: -40, Discount: 0.25, Quantity: 1, ShipMode: 'Standard' },
  { OrderID: 'RE-806', OrderDate: '2025-02-09', Category: 'Office Supplies', SubCategory: 'Binders', Sales: 110, Profit: 32, Discount: 0.00, Quantity: 4, ShipMode: 'Standard' },
  { OrderID: 'RE-807', OrderDate: '2025-02-15', Category: 'Technology', SubCategory: 'Accessories', Sales: 230, Profit: 75, Discount: 0.05, Quantity: 3, ShipMode: 'Express' },
  { OrderID: 'RE-808', OrderDate: '2025-02-21', Category: 'Furniture', SubCategory: 'Bookcases', Sales: 510, Profit: 60, Discount: 0.10, Quantity: 2, ShipMode: 'Standard' },
  { OrderID: 'RE-809', OrderDate: '2025-03-01', Category: 'Office Supplies', SubCategory: 'Art', Sales: 78, Profit: 22, Discount: 0.00, Quantity: 3, ShipMode: 'Same Day' },
  { OrderID: 'RE-810', OrderDate: '2025-03-08', Category: 'Technology', SubCategory: 'Phones', Sales: 1120, Profit: 290, Discount: 0.10, Quantity: 2, ShipMode: 'Express' },
  { OrderID: 'RE-811', OrderDate: '2025-03-14', Category: 'Furniture', SubCategory: 'Chairs', Sales: 420, Profit: 95, Discount: 0.05, Quantity: 2, ShipMode: 'Standard' },
  { OrderID: 'RE-812', OrderDate: '2025-03-20', Category: 'Office Supplies', SubCategory: 'Storage', Sales: 290, Profit: 55, Discount: 0.10, Quantity: 3, ShipMode: 'Standard' },
  { OrderID: 'RE-813', OrderDate: '2025-04-01', Category: 'Technology', SubCategory: 'Laptops', Sales: 2200, Profit: 620, Discount: 0.05, Quantity: 2, ShipMode: 'Express' },
  { OrderID: 'RE-814', OrderDate: '2025-04-11', Category: 'Furniture', SubCategory: 'Tables', Sales: 780, Profit: 110, Discount: 0.15, Quantity: 2, ShipMode: 'Same Day' },
  { OrderID: 'RE-815', OrderDate: '2025-04-18', Category: 'Office Supplies', SubCategory: 'Paper', Sales: 65, Profit: 28, Discount: 0.00, Quantity: 6, ShipMode: 'Standard' }
];

export const SAMPLE_HR_TEAMS = [
  { EmpID: 'EMP-01', Department: 'Engineering', Role: 'Senior Developer', Salary: 145000, Rating: 4.8, ExperienceYears: 7, Location: 'Remote', JoinedDate: '2021-03-15' },
  { EmpID: 'EMP-02', Department: 'Product', Role: 'Product Manager', Salary: 132000, Rating: 4.5, ExperienceYears: 5, Location: 'New York', JoinedDate: '2022-01-10' },
  { EmpID: 'EMP-03', Department: 'Design', Role: 'UI/UX Designer', Salary: 115000, Rating: 4.6, ExperienceYears: 4, Location: 'San Francisco', JoinedDate: '2022-06-20' },
  { EmpID: 'EMP-04', Department: 'Engineering', Role: 'DevOps Lead', Salary: 158000, Rating: 4.9, ExperienceYears: 9, Location: 'Remote', JoinedDate: '2020-08-01' },
  { EmpID: 'EMP-05', Department: 'Marketing', Role: 'Growth Specialist', Salary: 92000, Rating: 4.1, ExperienceYears: 3, Location: 'London', JoinedDate: '2023-02-14' },
  { EmpID: 'EMP-06', Department: 'Sales', Role: 'Account Executive', Salary: 110000, Rating: 4.3, ExperienceYears: 4, Location: 'New York', JoinedDate: '2022-11-05' },
  { EmpID: 'EMP-07', Department: 'Engineering', Role: 'QA Specialist', Salary: 98000, Rating: 4.2, ExperienceYears: 3, Location: 'Remote', JoinedDate: '2023-04-18' },
  { EmpID: 'EMP-08', Department: 'Product', Role: 'Data Analyst', Salary: 108000, Rating: 4.7, ExperienceYears: 4, Location: 'San Francisco', JoinedDate: '2022-09-01' },
  { EmpID: 'EMP-09', Department: 'Design', Role: 'Brand Designer', Salary: 102000, Rating: 4.0, ExperienceYears: 3, Location: 'London', JoinedDate: '2023-07-22' },
  { EmpID: 'EMP-10', Department: 'Sales', Role: 'Sales Manager', Salary: 150000, Rating: 4.8, ExperienceYears: 8, Location: 'New York', JoinedDate: '2021-01-15' }
];

export function getSampleDataset(type: 'saas' | 'retail' | 'hr'): Dataset {
  let rawData: Record<string, any>[] = [];
  let fileName = '';

  if (type === 'saas') {
    rawData = SAMPLE_SAAS_SALES;
    fileName = 'SaaS_Subscription_Metrics.csv';
  } else if (type === 'retail') {
    rawData = SAMPLE_RETAIL_STORE;
    fileName = 'Retail_Orders_Logistics.csv';
  } else {
    rawData = SAMPLE_HR_TEAMS;
    fileName = 'Tech_HR_Org_Analytics.csv';
  }

  const columns = Object.keys(rawData[0]);
  const profiles = profileDataset(rawData, columns);

  return {
    fileName,
    hasHeader: true,
    data: rawData,
    columns,
    profiles,
    delimiter: ',',
  };
}

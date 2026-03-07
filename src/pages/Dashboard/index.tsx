import React from "react";
import StockSearch from "../../components/features/StockSearch";
import NewsFeed from "../../components/features/NewsFeed/NewsFeed";

const Dashboard: React.FC = () => {
  return (
    <div className="page">
      <div className="page-content">
        <StockSearch />
      </div>
      <NewsFeed />
    </div>
  );
};

export default Dashboard;

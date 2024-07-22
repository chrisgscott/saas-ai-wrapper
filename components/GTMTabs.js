import { useState } from 'react';
import { STRATEGY_SECTIONS } from '../constants';
import IdealClient from './GTMSections/IdealClient';
import PositioningStatements from './GTMSections/PositioningStatements';
import PotentialPartners from './GTMSections/PotentialPartners';
import LaunchStrategies from './GTMSections/LaunchStrategies';
import ContentMarketingPlan from './GTMSections/ContentMarketingPlan';
import PostLaunchStrategies from './GTMSections/PostLaunchStrategies';

const componentMap = {
  [STRATEGY_SECTIONS[1]]: IdealClient,
  [STRATEGY_SECTIONS[2]]: PositioningStatements,
  [STRATEGY_SECTIONS[3]]: PotentialPartners,
  [STRATEGY_SECTIONS[4]]: LaunchStrategies,
  [STRATEGY_SECTIONS[5]]: ContentMarketingPlan,
  [STRATEGY_SECTIONS[6]]: PostLaunchStrategies,
};

export default function GTMTabs({ strategyId }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {STRATEGY_SECTIONS.slice(1).map((section, index) => (
            <button
              key={section}
              className={`${
                index === activeTab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab(index)}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {STRATEGY_SECTIONS.slice(1).map((section, index) => {
          const Component = componentMap[section];
          return (
            <div key={section} className={index === activeTab ? '' : 'hidden'}>
              <Component strategyId={strategyId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { Link, useLocation } from "wouter";

type Tab = {
  name: string;
  path: string;
  icon: string;
};

const tabs: Tab[] = [
  {
    name: "Games",
    path: "/",
    icon: "fas fa-dice",
  },
  {
    name: "Cash Out",
    path: "/cashout",
    icon: "fas fa-money-bill-wave",
  },
  {
    name: "Approvals",
    path: "/approvals",
    icon: "fas fa-check-circle",
  },
  {
    name: "Profile",
    path: "/profile",
    icon: "fas fa-user",
  },
];

export default function TabNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 max-w-md mx-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.path}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            location === tab.path ? "text-primary" : "text-gray-500"
          }`}
        >
          <i className={`${tab.icon} text-xl`}></i>
          <span className="text-xs mt-1">{tab.name}</span>
        </Link>
      ))}
    </div>
  );
}

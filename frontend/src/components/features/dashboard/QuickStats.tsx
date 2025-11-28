import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface QuickStatProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  link: string;
  subtitle?: string;
  subtitleValue?: string | number;
}

export const QuickStat: React.FC<QuickStatProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  link,
  subtitle,
  subtitleValue,
}) => {
  return (
    <Link to={link} className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{subtitle}</span>
            <span className={`font-semibold ${color}`}>{subtitleValue}</span>
          </div>
        </div>
      )}
    </Link>
  );
};

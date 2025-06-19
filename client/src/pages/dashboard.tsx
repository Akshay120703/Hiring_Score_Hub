import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  Users, 
  TrendingUp, 
  Percent,
  Plus,
  Download,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import StatsCard from "@/components/stats-card";
import EvaluationForm from "@/components/evaluation-form";
import CandidateTable from "@/components/candidate-table";
import { DashboardStats, CandidateWithEvaluations } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery<CandidateWithEvaluations[]>({
    queryKey: ['/api/candidates'],
  });

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/evaluations');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'evaluations.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (statsLoading || candidatesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assessment Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage and evaluate candidate assessments</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="app-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Assessment</span>
            </Button>
            <Button 
              onClick={handleExport}
              className="app-success flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Assessments"
            value={stats?.activeAssessments || 0}
            icon={<ClipboardCheck className="w-6 h-6" />}
            color="primary"
            trend={{ value: 8, direction: "up", period: "from last week" }}
          />
          <StatsCard
            title="Candidates Evaluated"
            value={stats?.candidatesEvaluated || 0}
            icon={<Users className="w-6 h-6" />}
            color="secondary"
            trend={{ value: 12, direction: "up", period: "from last month" }}
          />
          <StatsCard
            title="Average Score"
            value={stats?.averageScore || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="success"
            trend={{ value: 3, direction: "up", period: "improvement" }}
          />
          <StatsCard
            title="Pass Rate"
            value={`${stats?.passRate || 0}%`}
            icon={<Percent className="w-6 h-6" />}
            color="orange"
            trend={{ value: 2, direction: "down", period: "from last month" }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EvaluationForm />
          <CandidateTable candidates={candidates || []} />
        </div>

        {/* Rubric Management Section */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Rubric</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Candidate</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">Technical Interview</h4>
                <p className="text-sm text-gray-600 mb-3">Comprehensive technical assessment</p>
                <div className="text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Criteria:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Score:</span>
                    <span className="font-medium">40</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">Behavior Assessment</h4>
                <p className="text-sm text-gray-600 mb-3">Evaluates soft skills and team fit</p>
                <div className="text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Criteria:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Score:</span>
                    <span className="font-medium">30</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Create New Rubric</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

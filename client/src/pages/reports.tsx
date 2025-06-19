import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Users, TrendingUp, Award } from "lucide-react";
import { EvaluationWithDetails, DashboardStats } from "@shared/schema";

export default function Reports() {
  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery<EvaluationWithDetails[]>({
    queryKey: ['/api/evaluations'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/evaluations');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'evaluations-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (evaluationsLoading || statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  const completedEvaluations = evaluations.filter(e => e.status === 'completed');
  const averageScore = completedEvaluations.length > 0
    ? completedEvaluations.reduce((sum, e) => sum + parseFloat(e.overallScore), 0) / completedEvaluations.length
    : 0;

  const scoreDistribution = {
    excellent: completedEvaluations.filter(e => parseFloat(e.overallScore) >= 9).length,
    good: completedEvaluations.filter(e => parseFloat(e.overallScore) >= 7 && parseFloat(e.overallScore) < 9).length,
    average: completedEvaluations.filter(e => parseFloat(e.overallScore) >= 5 && parseFloat(e.overallScore) < 7).length,
    poor: completedEvaluations.filter(e => parseFloat(e.overallScore) < 5).length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluation Reports</h2>
            <p className="text-gray-600 mt-1">Comprehensive analysis of candidate assessments</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleExport} className="app-success flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{completedEvaluations.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{averageScore.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.passRate || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Candidates</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.candidatesEvaluated || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{scoreDistribution.excellent}</div>
                <div className="text-sm text-green-600">Excellent (9-10)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{scoreDistribution.good}</div>
                <div className="text-sm text-blue-600">Good (7-8.9)</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{scoreDistribution.average}</div>
                <div className="text-sm text-yellow-600">Average (5-6.9)</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{scoreDistribution.poor}</div>
                <div className="text-sm text-red-600">Poor (&lt;5)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Evaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            {completedEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations completed yet</h3>
                <p className="text-gray-500">Complete some evaluations to see reports here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Rubric</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Evaluator</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedEvaluations.slice(0, 10).map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {evaluation.candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium">{evaluation.candidate.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{evaluation.candidate.position}</TableCell>
                        <TableCell>{evaluation.rubric.name}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              parseFloat(evaluation.overallScore) >= 8 
                                ? "bg-green-100 text-green-800"
                                : parseFloat(evaluation.overallScore) >= 6
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {evaluation.overallScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              parseFloat(evaluation.overallScore) >= 7
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {parseFloat(evaluation.overallScore) >= 7 ? "Passed" : "Under Review"}
                          </Badge>
                        </TableCell>
                        <TableCell>{evaluation.evaluatorName}</TableCell>
                        <TableCell>{new Date(evaluation.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

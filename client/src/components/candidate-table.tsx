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
import { CandidateWithEvaluations } from "@shared/schema";

interface CandidateTableProps {
  candidates: CandidateWithEvaluations[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const getScoreBadgeColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-secondary', 
      'bg-green-500',
      'bg-orange-500',
      'bg-purple-500',
      'bg-pink-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Show top candidates with evaluations
  const candidatesWithScores = candidates
    .filter(candidate => candidate.averageScore !== undefined)
    .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Candidate Comparison</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {candidatesWithScores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No evaluated candidates yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete some evaluations to see comparisons</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="text-center">Evaluations</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatesWithScores.map((candidate) => {
                  const completedEvaluations = candidate.evaluations.filter(e => e.status === 'completed');
                  const avgScore = candidate.averageScore || 0;
                  
                  return (
                    <TableRow key={candidate.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${getAvatarColor(candidate.name)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                            {getInitials(candidate.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{candidate.name}</p>
                            <p className="text-xs text-gray-600">{candidate.position}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {completedEvaluations.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getScoreBadgeColor(avgScore)}>
                          {avgScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            avgScore >= 7 
                              ? "bg-green-100 text-green-800"
                              : avgScore >= 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {avgScore >= 7 ? "Passed" : avgScore >= 5 ? "Review" : "Rejected"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

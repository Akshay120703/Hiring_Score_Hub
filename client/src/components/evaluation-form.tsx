import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import RatingScale from "./rating-scale";
import { Code, Brain, MessageSquare, Clipboard } from "lucide-react";
import { Candidate, Rubric, insertEvaluationSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const iconMap = {
  code: Code,
  brain: Brain,
  comments: MessageSquare,
  clipboard: Clipboard,
} as const;

const colorMap = {
  "#2E86AB": "text-primary",
  "#A23B72": "text-secondary", 
  "#28A745": "text-green-600",
} as const;

export default function EvaluationForm() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
  });

  const { data: rubrics = [] } = useQuery<Rubric[]>({
    queryKey: ['/api/rubrics'],
  });

  const selectedRubric = rubrics.find(r => r.id.toString() === selectedRubricId);

  const saveEvaluationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/evaluations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Success",
        description: "Evaluation saved successfully",
      });
      // Reset form
      setScores({});
      setNotes("");
      setSelectedCandidateId("");
      setSelectedRubricId("");
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to save evaluation",
        variant: "destructive",
      });
    },
  });

  const handleScoreChange = (criterionId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: score
    }));
  };

  const calculateOverallScore = (): number => {
    if (!selectedRubric) return 0;
    
    const allCriteria = selectedRubric.categories.flatMap(cat => cat.criteria);
    const totalPossible = allCriteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
    const totalActual = allCriteria.reduce((sum, criterion) => {
      return sum + (scores[criterion.id] || 0);
    }, 0);
    
    return totalPossible > 0 ? (totalActual / totalPossible) * 10 : 0;
  };

  const getProgress = (): number => {
    if (!selectedRubric) return 0;
    
    const allCriteria = selectedRubric.categories.flatMap(cat => cat.criteria);
    const completedCriteria = allCriteria.filter(criterion => scores[criterion.id] !== undefined);
    
    return allCriteria.length > 0 ? (completedCriteria.length / allCriteria.length) * 100 : 0;
  };

  const handleSubmit = (status: 'draft' | 'completed') => {
    if (!selectedCandidateId || !selectedRubricId) {
      toast({
        title: "Error",
        description: "Please select a candidate and rubric",
        variant: "destructive",
      });
      return;
    }

    const overallScore = calculateOverallScore();
    
    const evaluationData = {
      candidateId: parseInt(selectedCandidateId),
      rubricId: parseInt(selectedRubricId),
      scores,
      overallScore: overallScore.toFixed(2),
      notes: notes || null,
      evaluatorName: "Current User", // In real app, get from auth
      status,
    };

    saveEvaluationMutation.mutate(evaluationData);
  };

  const progress = getProgress();
  const overallScore = calculateOverallScore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evaluate Candidate</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <Progress value={progress} className="w-24" />
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Candidate Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Candidate</label>
          <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a candidate to evaluate" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id.toString()}>
                  {candidate.name} - {candidate.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rubric Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Rubric</label>
          <Select value={selectedRubricId} onValueChange={setSelectedRubricId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an evaluation rubric" />
            </SelectTrigger>
            <SelectContent>
              {rubrics.map((rubric) => (
                <SelectItem key={rubric.id} value={rubric.id.toString()}>
                  {rubric.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Evaluation Criteria */}
        {selectedRubric && (
          <div className="space-y-6">
            {selectedRubric.categories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Clipboard;
              const colorClass = colorMap[category.color as keyof typeof colorMap] || "text-gray-600";
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className={`text-md font-semibold mb-3 flex items-center ${colorClass}`}>
                    <IconComponent className="w-5 h-5 mr-2" />
                    {category.name}
                  </h4>
                  <div className="space-y-4">
                    {category.criteria.map((criterion) => (
                      <div key={criterion.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {criterion.name}
                        </label>
                        <RatingScale
                          maxScore={criterion.maxScore}
                          value={scores[criterion.id]}
                          onChange={(score) => handleScoreChange(criterion.id, score)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notes */}
        {selectedRubric && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <Textarea
              placeholder="Add any additional comments or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Submit Actions */}
        {selectedRubric && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Overall Score: <Badge variant="outline" className="ml-1">{overallScore.toFixed(1)}/10</Badge>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit('draft')}
                  disabled={saveEvaluationMutation.isPending}
                >
                  Save Draft
                </Button>
                <Button 
                  onClick={() => handleSubmit('completed')}
                  disabled={saveEvaluationMutation.isPending}
                  className="app-primary"
                >
                  {saveEvaluationMutation.isPending ? "Submitting..." : "Submit Evaluation"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

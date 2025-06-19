import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Upload, Edit, Trash2, FileText, Users } from "lucide-react";
import { Rubric, insertRubricSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Rubrics() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: rubrics = [], isLoading } = useQuery<Rubric[]>({
    queryKey: ['/api/rubrics'],
  });

  const createRubricMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/rubrics', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rubrics'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Rubric created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create rubric",
        variant: "destructive",
      });
    },
  });

  const deleteRubricMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/rubrics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rubrics'] });
      toast({
        title: "Success",
        description: "Rubric deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete rubric",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertRubricSchema.extend({
      categories: insertRubricSchema.shape.categories.optional()
    })),
    defaultValues: {
      name: "",
      description: "",
      maxScore: 40,
      categories: [
        {
          id: "technical",
          name: "Technical Skills",
          icon: "code",
          color: "#2E86AB",
          criteria: [
            { id: "problem-solving", name: "Problem Solving", maxScore: 10, weight: 1 },
            { id: "code-quality", name: "Code Quality", maxScore: 10, weight: 1 }
          ]
        },
        {
          id: "communication",
          name: "Communication",
          icon: "comments",
          color: "#28A745",
          criteria: [
            { id: "clarity", name: "Clarity & Articulation", maxScore: 10, weight: 1 }
          ]
        }
      ],
    },
  });

  const onSubmit = (data: any) => {
    createRubricMutation.mutate(data);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/rubrics/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/rubrics'] });
        setIsImportDialogOpen(false);
        toast({
          title: "Success",
          description: "Rubric imported successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to import rubric",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import rubric",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg">Loading rubrics...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluation Rubrics</h2>
            <p className="text-gray-600 mt-1">Create and manage assessment criteria</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Import CSV/JSON</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Rubric</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Upload a CSV or JSON file to import a rubric. For CSV format, include columns: name, description, maxScore.
                  </p>
                  <Input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileImport}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="app-secondary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Rubric</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Rubric</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rubric Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter rubric name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter rubric description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Score</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="40" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createRubricMutation.isPending}>
                        {createRubricMutation.isPending ? "Creating..." : "Create Rubric"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {rubrics.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rubrics found</h3>
                <p className="text-gray-500 mb-4">
                  Create your first evaluation rubric to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="app-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rubric
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rubrics.map((rubric) => (
              <Card key={rubric.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rubric.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteRubricMutation.mutate(rubric.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{rubric.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Categories:</span>
                      <Badge variant="outline">{rubric.categories.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Score:</span>
                      <span className="font-medium">{rubric.maxScore}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Criteria:</span>
                      <span className="font-medium">
                        {rubric.categories.reduce((sum, cat) => sum + cat.criteria.length, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {rubric.categories.slice(0, 3).map((category) => (
                        <Badge key={category.id} variant="secondary" className="text-xs">
                          {category.name}
                        </Badge>
                      ))}
                      {rubric.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rubric.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

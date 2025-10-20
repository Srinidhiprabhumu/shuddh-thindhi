import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subscriber } from "@shared/schema";

export default function AdminSubscribers() {
  const { toast } = useToast();
  
  const { data: subscribers = [], isLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/admin/subscribers"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/subscribers/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      toast({ title: "Subscriber removed successfully" });
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    deleteMutation.mutate(id);
  };

  const handleExport = () => {
    const csv = ["Email,Subscribed Date"]
      .concat(subscribers.map(s => `${s.email},${new Date(s.createdAt).toLocaleDateString()}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-page-title">
            Newsletter Subscribers
          </h1>
          {subscribers.length > 0 && (
            <Button onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : subscribers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No subscribers yet.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Subscribed Date</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <tr key={subscriber.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"} data-testid={`subscriber-row-${subscriber.id}`}>
                      <td className="p-4" data-testid={`text-email-${subscriber.id}`}>{subscriber.email}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(subscriber.id)}
                          data-testid={`button-delete-${subscriber.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

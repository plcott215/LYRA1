import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { User, Subscription, ToolHistory } from "@shared/schema";

// Admin dashboard component - provides analytics and administrative functions
const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [toolUsage, setToolUsage] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fetch admin data - in a real app, this would be secured with proper authorization
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for demo purposes - in a real app, this would be fetched from the server
        const mockUsers: User[] = [
          { 
            id: 1, 
            email: "user1@example.com", 
            username: "user1", 
            providerId: "google", 
            createdAt: new Date(),
            authProvider: "google",
            password: null,
            displayName: "User One",
            photoURL: null,
            stripeCustomerId: "cus_123",
            stripeSubscriptionId: "sub_123",
            trialEndsAt: null
          },
          { 
            id: 2, 
            email: "user2@example.com", 
            username: "user2", 
            providerId: "email", 
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            authProvider: "email",
            password: "hashed_password",
            displayName: null,
            photoURL: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            trialEndsAt: null
          },
          { 
            id: 3, 
            email: "user3@example.com", 
            username: "user3", 
            providerId: "google", 
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            authProvider: "google",
            password: null,
            displayName: "User Three",
            photoURL: "https://example.com/photo.jpg",
            stripeCustomerId: "cus_456",
            stripeSubscriptionId: "sub_456",
            trialEndsAt: null
          },
        ];
        
        const mockSubscriptions: Subscription[] = [
          { 
            id: 1, 
            userId: 1, 
            plan: "pro", 
            status: "active", 
            currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            stripeSubscriptionId: "sub_123",
            trialEndDate: null,
            cancelAtPeriodEnd: false,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          { 
            id: 2, 
            userId: 3, 
            plan: "pro", 
            status: "active", 
            currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            stripeSubscriptionId: "sub_456",
            trialEndDate: null,
            cancelAtPeriodEnd: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          },
        ];
        
        const mockToolUsage: Record<string, number> = {
          "proposal": 42,
          "email": 67,
          "pricing": 28,
          "contract": 15,
          "brief": 31
        };
        
        setUsers(mockUsers);
        setSubscriptions(mockSubscriptions);
        setToolUsage(mockToolUsage);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    setLocation("/auth");
  };

  // Calculate summary statistics
  const totalUsers = users.length;
  const totalSubscriptions = subscriptions.filter(sub => sub.status === "active").length;
  const conversionRate = totalUsers > 0 ? (totalSubscriptions / totalUsers * 100).toFixed(1) : "0";
  const totalToolUses = Object.values(toolUsage).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary"></div>
            <h1 className="text-xl font-bold">Lyra Admin</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalUsers}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalSubscriptions}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{conversionRate}%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Total Tool Uses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalToolUses}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Tool usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(toolUsage).map(([tool, count]) => (
                      <div key={tool} className="flex items-center">
                        <div className="w-1/3 font-medium capitalize">{tool}</div>
                        <div className="w-2/3">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${(count / Math.max(...Object.values(toolUsage))) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-sm text-right">{count} uses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map(user => (
                      <div key={user.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-md">
                        <div>
                          <p className="font-medium">{user.username || user.email}</p>
                          <p className="text-sm text-muted-foreground">Joined: {user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'}</p>
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            subscriptions.some(sub => sub.userId === user.id && sub.status === "active")
                              ? "bg-green-500/20 text-green-600"
                              : "bg-gray-500/20 text-gray-600"
                          }`}>
                            {subscriptions.some(sub => sub.userId === user.id && sub.status === "active") ? "Pro" : "Free"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Admin actions */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="w-full">
                    Export User Data
                  </Button>
                  <Button className="w-full">
                    Manage Subscriptions
                  </Button>
                  <Button className="w-full" variant="destructive">
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
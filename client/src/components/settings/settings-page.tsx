import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/context/subscription-context";
import { useTheme } from "@/context/theme-context";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export const SettingsPage = () => {
  const { user } = useAuth();
  const { isPro, subscriptionData } = useSubscription();
  const { theme, setTheme, canToggleTheme } = useTheme();
  const { toast } = useToast();
  
  // Account settings
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [exportNotifications, setExportNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  
  // API settings
  const [signature, setSignature] = useState("");
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  const handleSaveAppearance = async () => {
    try {
      // We don't need to do anything special here since setTheme in 
      // ThemeContext already updates localStorage and applies the theme
      
      toast({
        title: "Appearance Settings Updated",
        description: "Your theme preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your appearance settings.",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveAPI = () => {
    toast({
      title: "API Settings Updated",
      description: "Your API settings have been saved.",
    });
  };
  
  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for instructions to reset your password.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Profile Settings */}
      <Card className="shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-background border-border focus:ring-primary"
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border-border focus:ring-primary"
                placeholder="your@email.com"
                disabled={!!user?.email}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Information */}
      <Card className="shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-background p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{isPro ? "Pro Plan" : "Free Plan"}</p>
                {isPro && subscriptionData?.endDate && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {new Date(subscriptionData.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {!isPro && (
                <Link href="/subscribe">
                  <Button className="bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
              {isPro && (
                <Button variant="outline">
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-background p-4 rounded-md">
              <h4 className="font-medium mb-2">Usage</h4>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "45%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">45% of monthly limit used</p>
            </div>
            <div className="bg-background p-4 rounded-md">
              <h4 className="font-medium mb-2">History</h4>
              <p className="text-sm text-muted-foreground">30 days of history retention</p>
              {!isPro && (
                <p className="text-xs text-primary mt-2">Upgrade to Pro for unlimited history</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive emails about your account and activity</p>
            </div>
            <Switch 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Export Confirmations</p>
              <p className="text-sm text-muted-foreground">Get notified when your exports are complete</p>
            </div>
            <Switch 
              checked={exportNotifications} 
              onCheckedChange={setExportNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Weekly Usage Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly summaries of your tool usage</p>
            </div>
            <Switch 
              checked={weeklyReports} 
              onCheckedChange={setWeeklyReports} 
            />
          </div>

          <Button onClick={handleSaveNotifications} className="bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]">
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Appearance</CardTitle>
          {!isPro && (
            <Badge className="bg-primary text-black">Pro Feature</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div 
              className={`p-4 rounded-md flex flex-col items-center justify-center cursor-pointer border-2 ${
                theme === "light" ? "border-primary" : "border-transparent"
              } ${!canToggleTheme ? 'opacity-100' : 'opacity-100'}`}
              onClick={() => setTheme("light")}
            >
              <div className="w-10 h-10 rounded-md bg-white border mb-2"></div>
              <span className="text-sm font-medium">Light</span>
            </div>
            
            <div 
              className={`p-4 rounded-md flex flex-col items-center justify-center border-2 ${
                theme === "dark" ? "border-primary" : "border-transparent"
              } ${canToggleTheme ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => canToggleTheme && setTheme("dark")}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-md bg-black border mb-2"></div>
                {!canToggleTheme && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">Dark</span>
                {!canToggleTheme && (
                  <span className="inline-block w-3 h-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-primary">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
            
            <div 
              className={`p-4 rounded-md flex flex-col items-center justify-center border-2 ${
                theme === "system" ? "border-primary" : "border-transparent"
              } ${canToggleTheme ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => canToggleTheme && setTheme("system")}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-md bg-gradient-to-r from-white to-black border mb-2"></div>
                {!canToggleTheme && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">System</span>
                {!canToggleTheme && (
                  <span className="inline-block w-3 h-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-primary">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pro restriction removed - all users can access dark mode */}

          <Button 
            onClick={handleSaveAppearance} 
            className="bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]"
          >
            Save Appearance Settings
          </Button>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card className="shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardHeader>
          <CardTitle>API & Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Email Signature</label>
            <Textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={4}
              className="w-full bg-background border-border focus:ring-primary resize-none"
              placeholder="Enter your default email signature..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              This signature will be automatically appended to emails created with the Email Rewriter.
            </p>
          </div>

          <Button onClick={handleSaveAPI} className="bg-primary text-black font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)]">
            Save API Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-[0_0_10px_rgba(252,238,9,0.2)]">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Change Password</p>
            <p className="text-sm text-muted-foreground mb-3">Reset your account password</p>
            <Button 
              variant="outline" 
              onClick={handlePasswordReset}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Send Password Reset Email
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="font-medium text-destructive">Danger Zone</p>
            <p className="text-sm text-muted-foreground mb-3">
              Delete your account and all of your data
            </p>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
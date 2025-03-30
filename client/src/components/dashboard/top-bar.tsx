import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/context/subscription-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/firebase";

interface TopBarProps {
  title: string;
}

const TopBar = ({ title }: TopBarProps) => {
  const { user } = useAuth();
  const { isPro, trialDaysLeft } = useSubscription();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "US";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background z-10">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {!isPro && (
          <div className="hidden md:flex items-center">
            <span className="text-muted-foreground text-sm mr-2">
              {trialDaysLeft} days left in trial
            </span>
            <Link href="/subscribe">
              <Button className="py-1 px-3 bg-primary text-primary-foreground text-sm font-medium hover:shadow-[0_0_10px_rgba(252,238,9,0.5)] transition-all duration-200">
                Upgrade
              </Button>
            </Link>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.email || "User"} />
                <AvatarFallback className="bg-muted">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            {!isPro && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/subscribe">
                    <span className="text-primary">Upgrade to Pro</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;

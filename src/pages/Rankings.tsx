
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CollectiveTopTen from "@/components/rankings/CollectiveTopTen";
import YourTopTen from "@/components/rankings/YourTopTen";

const Rankings = () => {
  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Top 10 NBA Player Rankings</h1>
        <p className="text-muted-foreground mt-2">
          See the community&apos;s collective Top 10 and submit your own rankings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Collective Top 10</CardTitle>
            <CardDescription>Calculated from all user rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <CollectiveTopTen />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Your Top 10</CardTitle>
            <CardDescription>Create and manage your personal rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <YourTopTen />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rankings;

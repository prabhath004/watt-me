import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Activity, BarChart3, Zap, Home, TrendingUp, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      <AdminHeader microgridId="admin" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-5xl font-black text-gray-800 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-3 font-medium">
              Manage and monitor the ShareWatt community
            </p>
          </div>

          {/* Action Cards - Sharp Modern Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Community Dashboard Card */}
            <Card className="h-96 bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 dark:bg-green-400">
                      <Users className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-gray-800 dark:text-white">Community Dashboard</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Multi-home energy management & analytics
                      </CardDescription>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-600 dark:bg-green-400"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Real-time energy flow visualization</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-500 dark:bg-green-300"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Community sharing analytics</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-400 dark:bg-green-200"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Grid interaction monitoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-300 dark:bg-green-100"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Historical data & trends</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/admin/community">
                    <Button className="w-full h-16 text-lg font-black bg-green-600 dark:bg-green-400 hover:bg-green-700 dark:hover:bg-green-300 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:border-green-700 dark:hover:border-green-300 transition-all duration-200">
                      <Users className="mr-3 h-5 w-5" />
                      View Community Dashboard
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Live Simulator Card */}
            <Card className="h-96 bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 dark:bg-green-400">
                      <Zap className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-gray-800 dark:text-white">Live Simulator</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Real-time energy flow simulation
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-green-600 dark:bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-black text-green-600 dark:text-green-400 uppercase tracking-wider">LIVE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-600 dark:bg-green-400 animate-pulse"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">20 homes streaming every 0.5s</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-500 dark:bg-green-300"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Interactive community map</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-400 dark:bg-green-200"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Real-time energy routing</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <div className="w-3 h-3 bg-green-300 dark:bg-green-100"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Outage simulation controls</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/admin/live">
                    <Button className="w-full h-16 text-lg font-black bg-green-600 dark:bg-green-400 hover:bg-green-700 dark:hover:bg-green-300 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:border-green-700 dark:hover:border-green-300 transition-all duration-200">
                      <Zap className="mr-3 h-5 w-5" />
                      View Live Dashboard
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 dark:bg-green-400">
                    <TrendingUp className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800 dark:text-white">Energy Efficiency</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Optimized sharing algorithms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 dark:bg-green-400">
                    <Shield className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800 dark:text-white">Grid Resilience</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Enhanced community backup</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 dark:bg-green-400">
                    <Clock className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800 dark:text-white">Real-time Monitoring</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">24/7 energy tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

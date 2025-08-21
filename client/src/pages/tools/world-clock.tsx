import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimezoneSelector } from "@/components/ui/timezone-selector";

import {
  type defaultWorldClockCities,
  allTimezones,
  continentalCities,
  getTimeForTimezone,
  getDateForTimezone,
  getTimezoneOffset,
  getUserTimezone,
} from "@/lib/time-tools";
import { Clock, Globe, Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorldClock() {
  const [currentTimes, setCurrentTimes] = useState<
    Record<string, { time: string; date: string; offset: string }>
  >({});
  const [continentalTimes, setContinentalTimes] = useState<
    Record<string, { time: string; date: string; offset: string }>
  >({});
  const [displayedCities, setDisplayedCities] = useState<
    typeof defaultWorldClockCities
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState(getUserTimezone());
  const [showAddClock, setShowAddClock] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const updateTimes = () => {
      // Update custom cities times
      const times: Record<
        string,
        { time: string; date: string; offset: string }
      > = {};
      displayedCities.forEach(city => {
        times[city.timezone] = {
          time: getTimeForTimezone(city.timezone),
          date: getDateForTimezone(city.timezone),
          offset: getTimezoneOffset(city.timezone),
        };
      });
      setCurrentTimes(times);

      // Update continental times
      const contTimes: Record<
        string,
        { time: string; date: string; offset: string }
      > = {};
      Object.values(continentalCities)
        .flat()
        .forEach(city => {
          contTimes[city.timezone] = {
            time: getTimeForTimezone(city.timezone),
            date: getDateForTimezone(city.timezone),
            offset: getTimezoneOffset(city.timezone),
          };
        });
      setContinentalTimes(contTimes);
    };

    // Update immediately
    updateTimes();

    // Update every second
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [displayedCities]);

  const getLocalTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const getLocalDate = () =>
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Filter timezones based on search
  const filteredTimezones = allTimezones.filter(
    city =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.timezone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new clock
  const addClock = () => {
    if (!selectedTimezone) {
      toast({
        title: "No Timezone Selected",
        description: "Please select a timezone to add.",
        variant: "destructive",
      });
      return;
    }

    const timezone = allTimezones.find(tz => tz.timezone === selectedTimezone);
    if (!timezone) return;

    // Check if already exists
    if (displayedCities.some(city => city.timezone === selectedTimezone)) {
      toast({
        title: "Clock Already Exists",
        description: `${timezone.name} is already displayed.`,
        variant: "destructive",
      });
      return;
    }

    setDisplayedCities([...displayedCities, timezone]);
    setSelectedTimezone("");
    setSearchQuery("");
    setShowAddClock(false);

    toast({
      title: "Clock Added",
      description: `Added ${timezone.name}, ${timezone.country} to your world clock.`,
    });
  };

  // Remove clock
  const removeClock = (timezoneToRemove: string) => {
    const timezone = displayedCities.find(
      city => city.timezone === timezoneToRemove
    );
    if (!timezone) return;

    setDisplayedCities(
      displayedCities.filter(city => city.timezone !== timezoneToRemove)
    );

    toast({
      title: "Clock Removed",
      description: `Removed ${timezone.name} from your world clock.`,
    });
  };

  // Clear all custom clocks
  const resetToDefault = () => {
    setDisplayedCities([]);
    toast({
      title: "Custom Clocks Cleared",
      description: "All custom clocks have been removed.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          World Clock
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Browse all continents and important time zones, then add the ones
          you're interested in to your custom clocks
        </p>
      </div>

      {/* Add Clock Control */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Clock
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddClock(!showAddClock)}
                size="sm"
                data-testid="add-clock-toggle"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddClock ? "Hide" : "Show"}
              </Button>
              {displayedCities.length > 0 && (
                <Button
                  onClick={resetToDefault}
                  variant="outline"
                  size="sm"
                  data-testid="reset-clocks"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {showAddClock ? <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="timezone-search">Search Timezone</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="timezone-search"
                    placeholder="Search by city or country..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="timezone-search"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone-select">Select Timezone</Label>
                <TimezoneSelector
                  value={selectedTimezone}
                  onValueChange={setSelectedTimezone}
                  placeholder="Choose a timezone..."
                  data-testid="timezone-select"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={addClock}
                  className="w-full"
                  data-testid="add-clock-confirm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Clock
                </Button>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>
                <strong>Custom clocks:</strong> {displayedCities.length}
              </p>
              <p>
                <strong>Available timezones:</strong> {filteredTimezones.length}
              </p>
            </div>
          </CardContent> : null}
      </Card>

      {/* Custom Clocks Section - Show above local time */}
      {displayedCities.length > 0 && (
        <div className="space-y-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                My Custom Clocks
                <Badge variant="outline" className="ml-3 text-xs">
                  {displayedCities.length}{" "}
                  {displayedCities.length === 1 ? "clock" : "clocks"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedCities
                  .sort((a, b) => {
                    const timeDataA = currentTimes[a.timezone];
                    const timeDataB = currentTimes[b.timezone];
                    if (!timeDataA || !timeDataB) return 0;
                    const offsetA =
                      parseInt(timeDataA.offset.replace(/[^\d-]/g, ""), 10) ||
                      0;
                    const offsetB =
                      parseInt(timeDataB.offset.replace(/[^\d-]/g, ""), 10) ||
                      0;
                    return offsetA - offsetB;
                  })
                  .map((city, index) => {
                    const timeData = currentTimes[city.timezone];

                    return (
                      <Card
                        key={city.timezone}
                        className="transition-all hover:shadow-md border-primary/20"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              <Globe className="w-4 h-4 mr-2" />
                              {city.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {city.country}
                              </Badge>
                              <Button
                                onClick={() => removeClock(city.timezone)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                                data-testid={`remove-clock-${index}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {timeData ? (
                            <div className="text-center">
                              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {timeData.time}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                {timeData.date}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">
                                {timeData.offset}
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Local Time */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Local Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
              {getLocalTime()}
            </div>
            <div className="text-lg text-slate-600 dark:text-slate-400 mb-2">
              {getLocalDate()}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Auto-detected timezone: {getUserTimezone()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continental View */}
      <div className="space-y-8">
        {Object.entries(continentalCities)
          .sort(([, citiesA], [, citiesB]) => {
            // Sort continents by their earliest timezone offset
            const minOffsetA = Math.min(
              ...citiesA.map(city => {
                const timeData = continentalTimes[city.timezone];
                return timeData
                  ? parseInt(timeData.offset.replace(/[^\d-]/g, ""), 10)
                  : 0;
              })
            );
            const minOffsetB = Math.min(
              ...citiesB.map(city => {
                const timeData = continentalTimes[city.timezone];
                return timeData
                  ? parseInt(timeData.offset.replace(/[^\d-]/g, ""), 10)
                  : 0;
              })
            );
            return minOffsetA - minOffsetB;
          })
          .map(([continent, cities]) => (
            <Card key={continent}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Globe className="w-6 h-6 mr-3" />
                  {continent}
                  <Badge variant="outline" className="ml-3 text-xs">
                    {cities.length} cities
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {cities
                    .sort((a, b) => {
                      // Sort cities within continent by timezone offset (smallest to largest)
                      const timeDataA = continentalTimes[a.timezone];
                      const timeDataB = continentalTimes[b.timezone];
                      if (!timeDataA || !timeDataB) return 0;
                      const offsetA = parseInt(
                        timeDataA.offset.replace(/[^\d-]/g, ""),
                        10
                      );
                      const offsetB = parseInt(
                        timeDataB.offset.replace(/[^\d-]/g, ""),
                        10
                      );
                      return offsetA - offsetB;
                    })
                    .map((city, index) => {
                      const timeData = continentalTimes[city.timezone];
                      const isInCustomClocks = displayedCities.some(
                        existing => existing.timezone === city.timezone
                      );

                      return (
                        <div
                          key={city.timezone}
                          className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg transition-all hover:shadow-sm relative"
                        >
                          {/* Remove button for cities that are in custom clocks */}
                          {isInCustomClocks ? (
                            <Button
                              onClick={() => removeClock(city.timezone)}
                              size="sm"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                              data-testid={`remove-continental-${continent}-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          ) : null}

                          <div className="flex items-center justify-center mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {city.name}
                            </h4>
                          </div>
                          <Badge variant="secondary" className="text-xs mb-3">
                            {city.country}
                          </Badge>
                          {timeData ? (
                            <div>
                              <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {timeData.time}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                {timeData.date}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">
                                {timeData.offset}
                              </div>
                            </div>
                          ) : null}

                          {!isInCustomClocks ? (
                            <Button
                              onClick={() => {
                                setDisplayedCities([...displayedCities, city]);
                                toast({
                                  title: "Clock Added",
                                  description: `Added ${city.name} to your custom clocks.`,
                                });
                              }}
                              size="sm"
                              variant="ghost"
                              className="mt-2 text-xs"
                              data-testid={`add-continental-${continent}-${index}`}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          ) : (
                            <Badge variant="outline" className="mt-2 text-xs">
                              In Custom Clocks
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

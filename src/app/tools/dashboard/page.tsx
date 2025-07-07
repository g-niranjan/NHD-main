"use client";

import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    Rectangle,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import Loader from "@/app/loading";
const personaColors = ['#2bbba6', '#cdaff4', '#f8bf8d', '#92a1ee', '#b0a1b0'];

const outerColors = {
    Passed: '#7cb156',
    Failed: '#fa7e66',
};

const tooltipStyle = {
    background: '#d6dada',
    color: '#000000',
    border: '1px solid #d6dada',
    borderRadius: 8,
    fontSize: 16,
    padding: 12,
};

// Types for dashboard API response
interface Persona {
  personaName: string;
  passed: number;
  failed: number;
}
interface Overview {
  agentCount: number;
  personaCount: number;
  testCases: number;
  passed: number;
  failed: number;
}
interface BarDatum {
  agentName: string;
  passed: number;
  failed: number;
}
interface DashboardData {
  pieChartData: Persona[];
  overview: Overview;
  barGraphData: BarDatum[];
}

// No Data Found SVG (matches screenshot style)
const NoDataFound = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <svg width="300" height="300" viewBox="0 0 120 120" fill="none">
        <g>
            <rect x="35" y="30" width="50" height="60" rx="8" fill="#f6fafd" stroke="#dbe6ef" strokeWidth="2"/>
            <rect x="35" y="60" width="50" height="10" rx="5" fill="#e0e7ef"/>
            <rect x="35" y="75" width="30" height="7" rx="3.5" fill="#e0e7ef"/>
            <circle cx="55" cy="52" r="3" fill="#b0b8c1"/>
            <circle cx="75" cy="52" r="3" fill="#b0b8c1"/>
            <path d="M60 65 Q65 72 70 65" stroke="#b0b8c1" strokeWidth="2" fill="none"/>
            <rect x="55" y="38" width="10" height="4" rx="2" fill="#e0e7ef"/>
            <rect x="48" y="34" width="4" height="4" rx="2" fill="#e0e7ef"/>
            <rect x="78" y="34" width="4" height="4" rx="2" fill="#e0e7ef"/>
            <rect x="35" y="95" width="50" height="2" rx="1" fill="#e0e7ef"/>
            <g>
            <path d="M40 30 l5 -10" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round"/>
            <path d="M45 30 l2 -7" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round"/>
            </g>
            <g>
            <circle cx="90" cy="60" r="7" fill="#f6fafd" stroke="#dbe6ef" strokeWidth="2"/>
            <rect x="92" y="60" width="6" height="2" rx="1" fill="#b0b8c1" transform="rotate(45 92 60)"/>
            </g>
            <g>
            <rect x="35" y="90" width="50" height="2" rx="1" fill="#e0e7ef"/>
            <rect x="30" y="100" width="60" height="2" rx="1" fill="#e0e7ef"/>
            </g>
        </g>
        </svg>
        <div style={{ color: '#b0b8c1', fontSize: 20, marginTop: 12 }}>No Data Found!</div>
     </div>
);

export default function DashboardCharts() {
    const [activeInnerIndex, setActiveInnerIndex] = useState<number | null>(null);
    const [activeOuterIndex, setActiveOuterIndex] = useState<number | null>(null);

    const handleInnerEnter = (_: any, index: number) => setActiveInnerIndex(index);
    const handleInnerLeave = () => setActiveInnerIndex(null);
    const handleOuterEnter = (_: any, index: number) => setActiveOuterIndex(index);
    const handleOuterLeave = () => setActiveOuterIndex(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tools/agent-dashboard')
            .then(res => res.json())
            .then(data => {
                console.log('%%%%%%%%%%%%%%%%%%%%%%%%',data)
                setDashboardData(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !dashboardData) {
        return <div style={{padding: 40, textAlign: 'center'}}> <Loader/></div>;
    }

    const { pieChartData, overview, barGraphData } = dashboardData;

    const innerData = pieChartData.map((persona: Persona) => ({
        name: persona.personaName,
        value: persona.passed + persona.failed,
    }));

    const outerData = pieChartData.flatMap((persona: Persona) => [
        {
            name: `${persona.personaName} - Passed`,
            value: persona.passed,
            persona: persona.personaName,
            type: 'Passed',
        },
        {
            name: `${persona.personaName} - Failed`,
            value: persona.failed,
            persona: persona.personaName,
            type: 'Failed',
        },
    ]);


    return (
        <div>
            <div
                style={{
                    // flex: 2,
                    margin: '10px 20px',
                    height: 100,
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                }}
            >
                <div style={{ display: 'flex', gap: 40, width: '100%', justifyContent: 'space-between', padding: '0 32px', margin: '0', alignItems: 'center' }}>
                    {/* Agent Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        {/* Custom robot agent icon */}
                        <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="24" fill="#F4F8FB" />
                            <ellipse cx="24" cy="28" rx="14" ry="10" fill="#E6ECF5" />
                            <circle cx="24" cy="20" r="10" fill="#fff" stroke="#1A365D" strokeWidth="2" />
                            <rect x="18" y="34" width="12" height="4" rx="2" fill="#1A365D" />
                            <rect x="12" y="24" width="4" height="8" rx="2" fill="#1A365D" />
                            <rect x="32" y="24" width="4" height="8" rx="2" fill="#1A365D" />
                            <circle cx="20" cy="20" r="2.5" fill="#1A365D" />
                            <circle cx="28" cy="20" r="2.5" fill="#1A365D" />
                            <rect x="22" y="24" width="4" height="2" rx="1" fill="#1A365D" />
                            <rect x="21" y="10" width="6" height="4" rx="2" fill="#1A365D" />
                            <rect x="16" y="8" width="4" height="4" rx="2" fill="#1A365D" />
                            <rect x="28" y="8" width="4" height="4" rx="2" fill="#1A365D" />
                            <rect x="19" y="38" width="10" height="2" rx="1" fill="#B3C6E0" />
                            <rect x="10" y="32" width="4" height="2" rx="1" fill="#B3C6E0" />
                            <rect x="34" y="32" width="4" height="2" rx="1" fill="#B3C6E0" />
                        </svg>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.agentCount}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Agents</div>
                        </div>
                    </div>
                    {/* Persona Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#ede7f6" /><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05C16.64 13.36 19 14.28 19 15.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5Z" fill="#7e57c2" /></svg>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.personaCount}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Personas</div>
                        </div>
                    </div>
                    {/* Test Cases */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#fff3e0" /><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V5h14v14Zm-7-3h2v2h-2v-2Zm0-8h2v6h-2V8Z" fill="#ff9800" /></svg>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.testCases}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Test Cases</div>
                        </div>
                    </div>
                    {/* Passed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#e8f5e9" /><path d="M9 16.2l-3.5-3.5 1.41-1.41L9 13.38l7.09-7.09 1.41 1.41L9 16.2Z" fill="#43a047" /></svg>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.passed}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Passed</div>
                        </div>
                    </div>
                    {/* Failed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#ffebee" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59Z" fill="#e53935" /></svg>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.failed}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Failed</div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    gap: '20px',
                    padding: 20,
                    boxSizing: 'border-box',
                }}
            >
                {/* Bar Chart */}
                <div
                    style={{
                        flex: 2,
                        height: 600,
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        padding: '16px',
                        boxSizing: 'border-box',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ marginRight: 8 }}>
                            <rect x="3" y="11" width="4" height="8" rx="1" fill="#4CAF50" />
                            <rect x="10" y="7" width="4" height="12" rx="1" fill="#2196F3" />
                            <rect x="17" y="4" width="4" height="15" rx="1" fill="#FFC107" />
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>Agent-wise Test Results</span>
                    </div>

                    {barGraphData.length === 0 ? (
                        
                              <NoDataFound />  
                        
                    ) : (
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={barGraphData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a5f886" />
                                        <stop offset="100%" stopColor="#357b16" />
                                    </linearGradient>
                                    <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffc1b4" />
                                        <stop offset="100%" stopColor="#fc6443" />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="agentName" />
                                <YAxis />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                                <Bar
                                    dataKey="passed"
                                    name="Passed Test Cases"
                                    fill="url(#passGradient)"
                                    activeBar={<Rectangle fill="#c9fab3" stroke="#388E3C" />}
                                />
                                <Bar
                                    dataKey="failed"
                                    name="Failed Test Cases"
                                    fill="url(#failGradient)"
                                    activeBar={<Rectangle fill="#eb9180" stroke="#e65100" />}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div
                    style={{
                        flex: 2,
                        height: 600,
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        padding: '16px',
                        boxSizing: 'border-box',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ marginRight: 8 }}>
                            <circle cx="12" cy="12" r="10" fill="#afecf4" />
                            <path d="M12 2 a10 10 0 0 1 0 20 a10 10 0 0 1 0 -20" fill="#cdaff4" />
                            <path d="M12 2 a10 10 0 0 1 8.66 5" fill="#f8bf8d" />
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>Persona-wise Test Distribution</span>
                    </div>

                    {innerData.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={innerData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label
                                    onMouseEnter={handleInnerEnter}
                                    onMouseLeave={handleInnerLeave}
                                >
                                    {innerData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-inner-${index}`}
                                            fill={
                                                activeInnerIndex === index
                                                    ? "#d3d3d3"
                                                    : personaColors[index % personaColors.length]
                                            }
                                        />
                                    ))}
                                </Pie>

                                <Pie
                                    data={outerData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={130}
                                    outerRadius={180}
                                    onMouseEnter={handleOuterEnter}
                                    onMouseLeave={handleOuterLeave}
                                >
                                    {outerData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-outer-${index}`}
                                            fill={
                                                activeOuterIndex === index
                                                    ? "#d3d3d3"
                                                    : outerColors[entry.type as keyof typeof outerColors]
                                            }
                                        />
                                    ))}
                                </Pie>

                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    payload={innerData.map((entry: any, index: number) => ({
                                        value: entry.name,
                                        type: "square",
                                        color: personaColors[index % personaColors.length],
                                        id: entry.name,
                                    }))}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}











































































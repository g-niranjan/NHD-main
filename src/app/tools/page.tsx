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
import Image from 'next/image';
import personaImg from '@/public/audience.png';
import passedImg from '@/public/check.png';
import failedImg from '@/public/cross.png';
import testcasesImg from '@/public/bugs.png';
import agentImg from '@/public/agent.png';
import noDataImg from '@/public/no-data.png';
import communityImg from '@/public/community.png';
import statisticsImg from '@/public/statistics.png';

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
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 400,
        opacity: 0.7
    }}>
        <Image 
            src={noDataImg} 
            alt="Bar Chart" 
            width={200} 
            height={200} 
            style={{ 
                opacity: 0.5, 
                background: 'transparent', 
                pointerEvents: 'none',
                marginBottom: 16
            }} 
        />
        <span style={{ color: '#888', fontSize: 22, fontWeight: 500 }}>No Data Found</span>
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
                       <Image src={agentImg} alt="Bar Chart" width={70} height={70} style={{ marginRight: 8 }} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.agentCount}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Agents</div>
                        </div>
                    </div>
                    {/* Persona Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <Image src={personaImg} alt="Bar Chart" width={70} height={70} style={{ marginRight: 8 }} />
                    
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.personaCount}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Personas</div>
                        </div>
                    </div>
                    {/* Test Cases */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <Image src={testcasesImg} alt="Bar Chart" width={70} height={70} style={{ marginRight: 8 }} />
                        
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.testCases}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Test Cases</div>
                        </div>
                    </div>
                    {/* Passed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <Image src={passedImg} alt="Bar Chart" width={70} height={70} style={{ marginRight: 8 }} />
                        
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 32 }}>{overview.passed}</div>
                            <div style={{ fontSize: 18, color: '#888', marginTop: 2 }}>Passed</div>
                        </div>
                    </div>
                    {/* Failed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 170 }}>
                        <Image src={failedImg} alt="Bar Chart" width={70} height={70} style={{ marginRight: 8 }} />
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
                        <Image src={statisticsImg} alt="Bar Chart" width={35} height={35} style={{ marginRight: 8 }} />
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
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                                <Bar
                                    dataKey="passed"
                                    name="Passed Test Cases"
                                    fill="url(#passGradient)"
                                    activeBar={<Rectangle fill="#c9fab3" stroke="#388E3C" />}
                                    label={{ position: 'top', fill: '#357b16', fontWeight: 600 }}
                                />
                                <Bar
                                    dataKey="failed"
                                    name="Failed Test Cases"
                                    fill="url(#failGradient)"
                                    activeBar={<Rectangle fill="#eb9180" stroke="#e65100" />}
                                    label={{ position: 'top', fill: '#fc6443', fontWeight: 600 }}
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
                       <Image src={communityImg} alt="Bar Chart" width={35} height={35} style={{ marginRight: 8 }} />
                        
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











































































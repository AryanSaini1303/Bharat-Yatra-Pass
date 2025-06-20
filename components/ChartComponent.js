'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts';
import dayjs from 'dayjs';

export default function TicketsChart({ tickets }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    const counts = {};
    tickets.forEach(ticket => {
    //   const date = dayjs(ticket.dateTime).format('YYYY-MM-DD'); // Group by day
      const date = dayjs(ticket.dateTime).format('MMM YYYY'); // Uncomment to group by month
      counts[date] = (counts[date] || 0) + 1;
    });

    const formattedData = Object.entries(counts).map(([date, count]) => ({
      date,
      tickets: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    setChartData(formattedData);
  }, [tickets]);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 50, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date"/>
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Line
            type="monotone"
            dataKey="tickets"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 9 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

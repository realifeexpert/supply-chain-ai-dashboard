import { useState, useEffect } from "react";

export const ForecastLogs = () => {
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const logs = [
    { id: 1, node: "node_0x92", msg: "Vector analysis synchronized" },
    { id: 2, node: "node_alpha", msg: "Seasonality encoding applied" },
    { id: 3, node: "node_delta", msg: "Uncertainty variance computed" },
  ];

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8">
      <h4 className="font-black uppercase tracking-tighter text-[10px] mb-6 text-zinc-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
        LIVE_INFERENCE_LOG
      </h4>
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex gap-3 items-start border-l-2 border-zinc-300 dark:border-zinc-800 pl-4 py-1"
          >
            <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
              {timestamp}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-600 dark:text-zinc-400">
              {log.msg} for{" "}
              <span className="text-zinc-900 dark:text-zinc-100">
                {log.node}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

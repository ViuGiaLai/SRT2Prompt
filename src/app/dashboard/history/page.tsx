import { Panel } from "@/components/ui/Panel";
import { requireUser } from "@/src/lib/auth";
import { getUserPlan, listGenerations } from "@/src/lib/plans";

export default async function HistoryPage() {
  const user = await requireUser();
  const plan = await getUserPlan(user.id);
  const generations = await listGenerations(user.id, 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">History</h1>
        <p className="mt-2 text-sm text-muted">Generation history for your SRT2Prompt workspace.</p>
      </div>

      <Panel>
        {plan === "Free" ? (
          <div className="py-12 text-center">
            <h2 className="text-xl font-semibold">Project history is a Creator feature.</h2>
            <p className="mt-2 text-sm text-muted">Upgrade to Creator to review completed and failed generations.</p>
          </div>
        ) : generations.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-xl font-semibold">No generations yet.</h2>
            <p className="mt-2 text-sm text-muted">Generate your first content pack to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-normal text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Project</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Lines</th>
                  <th className="py-3 pr-4">Scenes</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {generations.map((item) => (
                  <tr key={item.id} className="border-b border-line/70">
                    <td className="py-3 pr-4 text-muted">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4">{item.summary}</td>
                    <td className="py-3 pr-4 text-muted">{item.videoType}</td>
                    <td className="py-3 pr-4 text-muted">{item.subtitleLines}</td>
                    <td className="py-3 pr-4 text-muted">{item.sceneCount}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                        item.status === "Completed" ? "bg-green-500/15 text-green-200" :
                        item.status === "Failed" ? "bg-red-500/15 text-red-200" :
                        "bg-yellow-500/15 text-yellow-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

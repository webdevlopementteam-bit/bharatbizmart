import ConversationList from "@/components/shared/ConversationList";

export const metadata = { title: "Messages" };

export default function DashboardMessagesPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Messages</h1>
      <ConversationList basePath="/dashboard/messages" />
    </div>
  );
}

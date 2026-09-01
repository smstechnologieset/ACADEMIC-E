"use client";

import React from "react";
import { ContactMessage } from "@/types";
import { Mail, Calendar, MessageSquare, Inbox } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

interface InquiriesProps {
  initialMessages: ContactMessage[];
}

export function InquiriesClient({ initialMessages }: InquiriesProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
          Admissions Inquiries Desk
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Incoming questions submitted via the public Contact Us desk on the homepage.
        </p>
      </div>

      {initialMessages.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Inquiries Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Messages sent by prospective applicants from the homepage contact desk will automatically appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {initialMessages.map((msg) => (
            <Card key={msg.id} className="p-6 bg-white border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <a href={`mailto:${msg.email}`} className="font-bold text-sm text-blue-600 hover:underline">
                      {msg.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span>{formatDate(msg.created_at)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

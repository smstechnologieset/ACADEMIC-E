import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { Application, ApplicationEvent } from "@/types";

// Register a default font (react-pdf ships with Helvetica)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #1e40af",
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 8,
    marginTop: 20,
    paddingBottom: 4,
    borderBottom: "1px solid #e2e8f0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 140,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: "#1e293b",
  },
  statusBadge: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    padding: "4 12",
    borderRadius: 4,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 12,
    borderLeft: "2px solid #e2e8f0",
  },
  timelineDate: {
    width: 100,
    fontSize: 8,
    color: "#94a3b8",
  },
  timelineEvent: {
    flex: 1,
    fontSize: 9,
    color: "#475569",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#94a3b8",
    borderTop: "1px solid #e2e8f0",
    paddingTop: 8,
  },
  refId: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
    marginTop: 4,
  },
});

function getStatusColor(status: string): string {
  switch (status) {
    case "approved": return "#16a34a";
    case "rejected": return "#ef4444";
    case "under_review": return "#2563eb";
    case "cancelled": return "#64748b";
    default: return "#d97706";
  }
}

interface DossierProps {
  application: Application;
  events?: ApplicationEvent[];
  fee?: string;
}

export function ApplicationDossierPdf({ application, events = [], fee }: DossierProps) {
  const app = application;
  const statusColor = getStatusColor(app.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Academic Excellence</Text>
          <Text style={styles.headerSubtitle}>
            Official Admissions Dossier • Confidential
          </Text>
          <Text style={styles.refId}>Ref: {app.id}</Text>
        </View>

        {/* Applicant Information */}
        <Text style={styles.sectionTitle}>Applicant Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{app.full_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{app.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{app.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{app.age || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{app.full_address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Qualification</Text>
          <Text style={styles.value}>{app.qualification || "—"}</Text>
        </View>

        {/* Academic Program */}
        <Text style={styles.sectionTitle}>Academic Program</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Course Applied</Text>
          <Text style={styles.value}>{app.course_applied}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Application Fee</Text>
          <Text style={styles.value}>{fee || "—"}</Text>
        </View>

        {/* Status & Payment */}
        <Text style={styles.sectionTitle}>Status & Payment</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: statusColor, fontFamily: "Helvetica-Bold" }]}>
            {app.status.toUpperCase().replace(/_/g, " ")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{app.payment_method || "Not yet submitted"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction Ref</Text>
          <Text style={styles.value}>{app.transaction_ref || "—"}</Text>
        </View>

        {/* Submission Details */}
        <Text style={styles.sectionTitle}>Submission Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Place</Text>
          <Text style={styles.value}>{app.place}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Signature</Text>
          <Text style={styles.value}>{app.signature}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Submitted</Text>
          <Text style={styles.value}>{app.submission_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Last Updated</Text>
          <Text style={styles.value}>{app.updated_at ? new Date(app.updated_at).toLocaleString() : "—"}</Text>
        </View>

        {/* Internal Notes */}
        {app.internal_notes && (
          <>
            <Text style={styles.sectionTitle}>Internal Notes</Text>
            <Text style={{ fontSize: 9, color: "#475569", lineHeight: 1.5 }}>
              {app.internal_notes}
            </Text>
          </>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Application Timeline</Text>
            {events.map((event) => (
              <View key={event.id} style={styles.timelineItem}>
                <Text style={styles.timelineDate}>
                  {new Date(event.created_at).toLocaleString("en-US", {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.timelineEvent}>
                  {event.event_type.replace(/_/g, " ")}
                  {event.new_value ? ` → ${event.new_value}` : ""}
                  {event.actor !== "system" ? ` (by ${event.actor})` : ""}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Academic Excellence Education Initiative • Powered by SMS Technologies • Generated {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
}

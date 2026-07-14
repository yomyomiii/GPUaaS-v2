import { useState } from "react";
import { Database, CreditCard, Server, Cpu, Users } from "lucide-react";
import {
  PRIMARY, PRIMARY_10, GRAY_5, GRAY_10, GRAY_40, GRAY_60, GRAY_70, GRAY_90,
  PageContainer, ListCard,
} from "./ConsoleLayout";

const TODAY = new Date("2026-07-14");

function relativeTime(datetime: string) {
  const diff = Math.floor((TODAY.getTime() - new Date(datetime).getTime()) / 1000);
  if (diff < 60)          return "방금";
  if (diff < 3600)        return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7)   return `${Math.floor(diff / 86400)}일 전`;
  return datetime.slice(0, 10);
}

type NotifType = "스토리지" | "크레딧" | "서버" | "GPU" | "멤버";

const typeMeta: Record<NotifType, { icon: React.ReactNode; bg: string; color: string }> = {
  스토리지: { icon: <Database size={15} />, bg: PRIMARY_10, color: PRIMARY },
  크레딧:   { icon: <CreditCard size={15} />, bg: PRIMARY_10, color: PRIMARY },
  서버:     { icon: <Server size={15} />,    bg: PRIMARY_10, color: PRIMARY },
  GPU:      { icon: <Cpu size={15} />,       bg: PRIMARY_10, color: PRIMARY },
  멤버:     { icon: <Users size={15} />,     bg: PRIMARY_10, color: PRIMARY },
};

const notificationsData: { time: string; type: NotifType; msg: string; read: boolean }[] = [
  { time: "2026-07-12 18:30:44", type: "스토리지", msg: "model-checkpoint 볼륨 스토리지 사용량이 99% (198 / 200 GB)에 도달했습니다.", read: false },
  { time: "2026-07-11 11:02:09", type: "크레딧",   msg: "크레딧 잔액이 설정한 임계값(50,000cr) 미만입니다. 현재 잔액: 45,230cr", read: false },
  { time: "2026-07-08 10:01:33", type: "스토리지", msg: "team-shared-01 공유 스토리지 사용량이 92% (460 / 500 GB)에 도달했습니다.", read: true },
];

export function NotificationsPage() {
  const [notifs, setNotifs] = useState(notificationsData);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (i: number) =>
    setNotifs(notifs.map((x, j) => j === i ? { ...x, read: true } : x));

  return (
    <PageContainer title="Notifications" subtitle="워크스페이스 알림을 확인하고 읽음 처리할 수 있습니다.">
      <ListCard title={`전체 ${notifs.length}건`} action={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {unreadCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              backgroundColor: PRIMARY_10, color: PRIMARY,
            }}>{unreadCount}개 미읽음</span>
          )}
          <button
            type="button"
            onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))}
            disabled={unreadCount === 0}
            style={{
              fontSize: 12, padding: "4px 12px", borderRadius: 6, fontWeight: 500,
              border: `1px solid ${unreadCount > 0 ? GRAY_10 : GRAY_10}`,
              backgroundColor: "white",
              color: unreadCount > 0 ? GRAY_70 : GRAY_40,
              cursor: unreadCount > 0 ? "pointer" : "default",
            }}>
            모두 읽음
          </button>
        </div>
      }>
        {notifs.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", fontSize: 13, color: GRAY_60 }}>
            알림이 없습니다.
          </div>
        ) : notifs.map((n, i) => {
          const meta = typeMeta[n.type];
          return (
            <div
              key={i}
              onClick={() => markRead(i)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 20px",
                borderBottom: i < notifs.length - 1 ? `1px solid ${GRAY_10}` : "none",
                backgroundColor: !n.read ? "rgb(250,249,255)" : "white",
                cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GRAY_5)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = !n.read ? "rgb(250,249,255)" : "white")}
            >
              {/* Unread dot */}
              <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 17,
                backgroundColor: !n.read ? PRIMARY : "transparent",
              }} />

              {/* Type icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                backgroundColor: meta.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: meta.color,
              }}>
                {meta.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, lineHeight: 1.55,
                  fontWeight: !n.read ? 500 : 400,
                  color: !n.read ? GRAY_90 : GRAY_70,
                }}>
                  {n.msg}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                    backgroundColor: meta.bg, color: meta.color,
                  }}>{n.type}</span>
                  <span style={{ fontSize: 11, color: GRAY_60 }}>{relativeTime(n.time)}</span>
                  <span style={{ fontSize: 11, color: GRAY_40 }}>·</span>
                  <span style={{ fontSize: 11, color: GRAY_60, fontVariantNumeric: "tabular-nums" }}>{n.time.slice(0, 16)}</span>
                </div>
              </div>

              {/* Read status */}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                flexShrink: 0, marginTop: 2,
                backgroundColor: !n.read ? PRIMARY : "transparent",
                border: `1px solid ${!n.read ? PRIMARY : "rgb(210,210,210)"}`,
                color: !n.read ? "white" : GRAY_60,
              }}>{!n.read ? "미읽음" : "읽음"}</span>
            </div>
          );
        })}
      </ListCard>
    </PageContainer>
  );
}

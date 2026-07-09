import { useState } from "react";
import {
  PRIMARY, GRAY_5, GRAY_60, GRAY_70, GRAY_90,
  Badge, PageContainer, ListCard,
} from "./ConsoleLayout";

const notificationsData = [
  { time: "2026-07-08 14:32", type: "서버", msg: "llm-finetuning 서버가 Running 상태로 전환되었습니다.", read: false },
  { time: "2026-07-08 10:15", type: "크레딧", msg: "크레딧 잔액이 50,000cr 미만입니다. 현재 잔액: 45,230cr", read: false },
  { time: "2026-07-07 22:41", type: "서버", msg: "stable-diffusion 서버가 Stopped 상태로 전환되었습니다.", read: true },
  { time: "2026-07-07 16:00", type: "멤버", msg: "장민준 님이 워크스페이스에 참여했습니다.", read: true },
  { time: "2026-07-06 09:30", type: "결제", msg: "크레딧 20,000cr 구매가 완료되었습니다.", read: true },
];

export function NotificationsPage() {
  const [notifs, setNotifs] = useState(notificationsData);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <PageContainer title="Notifications" subtitle="워크스페이스 알림을 확인하고 읽음 처리할 수 있습니다.">
      <ListCard title="Notifications" action={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {unreadCount > 0 && <Badge color="danger">{unreadCount} 미읽음</Badge>}
          <button onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))} style={{ fontSize: 12, color: PRIMARY, background: "none", border: "none", cursor: "pointer" }}>모두 읽음</button>
        </div>
      }>
        <div>
          {notifs.map((n, i) => (
            <div key={i} onClick={() => setNotifs(notifs.map((x, j) => j === i ? { ...x, read: true } : x))} style={{
              padding: "14px 20px", borderBottom: i < notifs.length - 1 ? `1px solid rgb(248,248,248)` : "none",
              backgroundColor: !n.read ? "rgb(250,249,255)" : "white",
              display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = GRAY_5}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.read ? "rgb(250,249,255)" : "white"}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: !n.read ? PRIMARY : "transparent", marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <Badge color={n.type === "서버" ? "primary" : n.type === "크레딧" ? "warning" : n.type === "결제" ? "success" : "neutral"}>{n.type}</Badge>
                  <span style={{ fontSize: 11, color: GRAY_60 }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 13, color: !n.read ? GRAY_90 : GRAY_70, lineHeight: 1.5 }}>{n.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </ListCard>
    </PageContainer>
  );
}

import { LocalVideo } from "./components/LocalVideo";
import { RemoteVideo } from "./components/RemoteVideo";
import { AppProvider, _useApp } from "./useApp";

export const App = () => {
  const ctx = _useApp();
  const { startCall, channelRef } = ctx;
  return (
    <AppProvider value={ctx}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h3>{ctx.userId}</h3>
        <LocalVideo />
        <RemoteVideo />
        <button
          onClick={async () => {
            const callOffer = await startCall();
            channelRef.current?.send({
              type: "broadcast",
              event: "call",
              payload: callOffer,
            });
          }}
        >
          Call
        </button>
        <button
          onClick={async () => {
            const callOffer = await startCall();
            channelRef.current?.send({
              type: "broadcast",
              event: "call_me",
              payload: callOffer,
            });
          }}
        >
          You call me
        </button>
        <button
          onClick={async () => {
            const callOffer = await startCall();
            channelRef.current?.send({
              type: "broadcast",
              event: "refresh",
              payload: callOffer,
            });
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }}
        >
          Refresh
        </button>
      </div>
    </AppProvider>
  );
};

//App.whyDidYouRender = true;

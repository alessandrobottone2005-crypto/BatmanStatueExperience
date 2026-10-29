import { Component, type ReactNode } from "react";
export default class ErrorBoundary extends Component<
  { children: ReactNode; onExit: () => void },
  { failed: boolean; retry: number }
> {
  state = { failed: false, retry: 0 };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="result-screen">
        <p className="eyebrow">MODALITÀ ALTERNATIVA</p>
        <h1>La Batcaverna non è disponibile.</h1>
        <p>
          Il browser non riesce ad avviare WebGL. Puoi riprovare o scoprire
          direttamente la statua.
        </p>
        <div className="action-row">
          <button
            onClick={() =>
              this.setState((s) => ({ failed: false, retry: s.retry + 1 }))
            }
          >
            Riprova
          </button>
          <button className="secondary" onClick={this.props.onExit}>
            Scopri la statua
          </button>
        </div>
      </section>
    ) : (
      <div key={this.state.retry}>{this.props.children}</div>
    );
  }
}

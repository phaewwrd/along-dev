export default function Loading() {
    return (
        <main className="app-shell" aria-busy="true" aria-label="Loading workspace">
            <aside className="sidebar loading-sidebar">
                <div className="brand">
                    <span className="brand-mark">A</span>
                    <span>along</span>
                </div>
                <div className="loading-lines">
                    <span />
                    <span />
                    <span />
                </div>
            </aside>
            <section className="content loading-content">
                <header className="topbar">
                    <span className="loading-bar short" />
                </header>
                <div className="page-heading">
                    <div>
                        <span className="loading-bar medium" />
                        <span className="loading-bar long" />
                    </div>
                </div>
                <div className="stats-grid">
                    {["total", "planning", "active", "hold", "complete", "cancelled"].map(
                        (key) => (
                            <div className="stat-card loading-block" key={key} />
                        ),
                    )}
                </div>
                <div className="section-grid">
                    <div className="panel loading-panel" />
                    <div className="panel loading-panel" />
                </div>
                <div className="panel loading-panel loading-task-panel" />
            </section>
        </main>
    );
}

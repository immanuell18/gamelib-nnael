export default function SkeletonCard() {
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            overflow: 'hidden',
        }}>
            {/* Image skeleton */}
            <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%' }} />

            {/* Content skeleton */}
            <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div className="skeleton" style={{ height: '18px', width: '85%' }} />
                <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '999px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '50px', borderRadius: '999px' }} />
                </div>
                <div className="skeleton" style={{ height: '34px', width: '100%', marginTop: '0.25rem' }} />
            </div>
        </div>
    )
}

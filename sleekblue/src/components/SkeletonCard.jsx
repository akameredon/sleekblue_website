export function SkeletonCard({ style = {} }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', ...style,
    }}>
      <div style={{ height: '200px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.4s infinite' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '10px', width: '70%', animation: 'skeletonShimmer 1.4s infinite' }} />
        <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '8px', animation: 'skeletonShimmer 1.4s infinite' }} />
        <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '6px', width: '85%', animation: 'skeletonShimmer 1.4s infinite' }} />
        <div style={{ height: '36px', background: '#f0f0f0', borderRadius: '8px', marginTop: '14px', animation: 'skeletonShimmer 1.4s infinite' }} />
      </div>
      <style>{`@keyframes skeletonShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

export function SkeletonText({ width = '100%', height = '14px', style = {} }) {
  return (
    <div style={{
      height, width, borderRadius: '6px',
      background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
      backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.4s infinite', ...style,
    }} />
  )
}

export function BlogPostSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 0 }}>
      <div style={{ width: '280px', minHeight: '180px', flexShrink: 0, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.4s infinite' }} />
      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '6px', width: '30%', marginBottom: '12px', animation: 'skeletonShimmer 1.4s infinite' }} />
        <div style={{ height: '18px', background: '#f0f0f0', borderRadius: '6px', width: '80%', marginBottom: '10px', animation: 'skeletonShimmer 1.4s infinite' }} />
        <div style={{ height: '13px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '8px', animation: 'skeletonShimmer 1.4s infinite' }} />
        <div style={{ height: '13px', background: '#f0f0f0', borderRadius: '6px', width: '65%', animation: 'skeletonShimmer 1.4s infinite' }} />
      </div>
    </div>
  )
}

import './PageWrapper.css'

function PageWrapper({ loading, children }) {
  return (
    <div className={`page-wrapper ${loading ? 'loading' : 'ready'}`}>
      {children}
    </div>
  )
}

export default PageWrapper

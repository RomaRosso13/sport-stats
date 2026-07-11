import './PageWrapper.css'

function PageWrapper({ loading }) {
  return (
    <div className={`page-wrapper ${loading ? 'loading' : 'ready'}`}>
    </div>
  )
}

export default PageWrapper

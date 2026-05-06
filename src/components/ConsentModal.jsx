export default function ConsentModal({ onGrant, onDeny }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div className="modal-title" id="consent-title">Before we analyze your contract</div>
        <div className="modal-body">
          <p>By proceeding, you confirm that:</p>
          <ul style={{ paddingLeft: '18px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>You have the right to share this document for analysis.</li>
            <li>The document will be processed by <strong>n8n</strong> and <strong>OpenAI</strong> to extract lease terms.</li>
            <li>Extracted data may be stored to generate your compliance report.</li>
            <li>You should not upload documents containing highly sensitive personal data beyond what is necessary for lease compliance review.</li>
          </ul>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onDeny}>Cancel</button>
          <button className="btn btn-primary" onClick={onGrant}>I understand — proceed</button>
        </div>
      </div>
    </div>
  )
}

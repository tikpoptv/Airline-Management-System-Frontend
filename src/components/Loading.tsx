import './Loading.css';

const Loading = ({ message = 'กำลังโหลด...' }: { message?: string }) => (
  <div className="loading-container">
    <div className="spinner" />
    <p>{message}</p>
  </div>
);

export default Loading;

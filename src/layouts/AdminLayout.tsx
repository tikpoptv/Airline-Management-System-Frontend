import { Navbar } from '../components';

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main style={{ padding: '20px' }}>{children}</main>
  </>
);

export default AdminLayout;
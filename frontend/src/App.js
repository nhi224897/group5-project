import { useState } from 'react';
import './App.css';
import { UserProvider } from './context/UserContext';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import Login from './components/Login';
import Profile from './components/Profile';
import Admin from './components/Admin';
import ForgotPassword from './components/ForgotPassword';
import UploadAvatar from './components/UploadAvatar';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">
          <h1>Ứng Dụng Của Tôi</h1>
        </div>
        <ul className="nav-links">
          <li>
            <button 
              className={activeTab === 'home' ? 'active' : ''} 
              onClick={() => setActiveTab('home')}
            >
              Trang Chủ
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'products' ? 'active' : ''} 
              onClick={() => setActiveTab('products')}
            >
              Sản Phẩm
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'about' ? 'active' : ''} 
              onClick={() => setActiveTab('about')}
            >
              Giới Thiệu
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'contact' ? 'active' : ''} 
              onClick={() => setActiveTab('contact')}
            >
              Liên Hệ
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'users' ? 'active' : ''} 
              onClick={() => setActiveTab('users')}
            >
              Người Dùng
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'login' ? 'active' : ''} 
              onClick={() => setActiveTab('login')}
            >
              Đăng Nhập
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              Hồ Sơ
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'admin' ? 'active' : ''} 
              onClick={() => setActiveTab('admin')}
            >
              Quản Trị
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'forgot-password' ? 'active' : ''} 
              onClick={() => setActiveTab('forgot-password')}
            >
              Quên Mật Khẩu
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'upload-avatar' ? 'active' : ''} 
              onClick={() => setActiveTab('upload-avatar')}
            >
              Tải Ảnh Đại Diện
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {activeTab === 'login' && (
          <section className="login-section">
            <Login />
          </section>
        )}
        {activeTab === 'profile' && (
          <section className="profile-section">
            <Profile />
          </section>
        )}
        {activeTab === 'admin' && (
          <section className="admin-section">
            <Admin />
          </section>
        )}
        {activeTab === 'forgot-password' && (
          <section className="forgot-password-section">
            <ForgotPassword />
          </section>
        )}
        {activeTab === 'upload-avatar' && (
          <section className="upload-avatar-section">
            <UploadAvatar />
          </section>
        )}
        {activeTab === 'users' && (
          <UserProvider>
            <section className="users-section">
              <h2>Quản Lý Người Dùng</h2>
              <AddUser />
              <UserList />
            </section>
          </UserProvider>
        )}
        {activeTab === 'home' && (
          <section className="home-section">
            <h2>Chào Mừng Đến Với Website Của Chúng Tôi</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Tính Năng 1</h3>
                <p>Chúng tôi cung cấp dịch vụ chất lượng cao nhất cho khách hàng.</p>
              </div>
              <div className="feature-card">
                <h3>Tính Năng 2</h3>
                <p>Đội ngũ nhân viên chuyên nghiệp, tận tâm với công việc.</p>
              </div>
              <div className="feature-card">
                <h3>Tính Năng 3</h3>
                <p>Luôn đổi mới và cập nhật công nghệ hiện đại.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="products-section">
            <h2>Sản Phẩm Của Chúng Tôi</h2>
            <div className="products-grid">
              <div className="product-card">
                <div className="product-image"></div>
                <h3>Sản Phẩm 1</h3>
                <p>Mô tả chi tiết về sản phẩm 1</p>
                <button className="btn-primary">Xem Thêm</button>
              </div>
              <div className="product-card">
                <div className="product-image"></div>
                <h3>Sản Phẩm 2</h3>
                <p>Mô tả chi tiết về sản phẩm 2</p>
                <button className="btn-primary">Xem Thêm</button>
              </div>
              <div className="product-card">
                <div className="product-image"></div>
                <h3>Sản Phẩm 3</h3>
                <p>Mô tả chi tiết về sản phẩm 3</p>
                <button className="btn-primary">Xem Thêm</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="about-section">
            <h2>Giới Thiệu</h2>
            <div className="about-content">
              <div className="about-text">
                <p>Chúng tôi là công ty hàng đầu trong lĩnh vực công nghệ, luôn mang đến những giải pháp tốt nhất cho khách hàng.</p>
                <p>Với đội ngũ nhân viên giàu kinh nghiệm, chúng tôi cam kết mang đến sự hài lòng cho khách hàng.</p>
              </div>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-image"></div>
                  <h3>Nguyễn Văn A</h3>
                  <p>Giám Đốc Điều Hành</p>
                </div>
                <div className="team-member">
                  <div className="member-image"></div>
                  <h3>Trần Thị B</h3>
                  <p>Giám Đốc Công Nghệ</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="contact-section">
            <h2>Liên Hệ Với Chúng Tôi</h2>
            <div className="contact-content">
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Họ Tên:</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Nội Dung:</label>
                  <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" className="btn-primary">Gửi Tin Nhắn</button>
              </form>
              <div className="contact-info">
                <h3>Thông Tin Liên Hệ</h3>
                <p>Email: bao226405@student.nctu.edu.vn</p>
                <p>Điện thoại: (+87)7829 78954 </p>
                <p>Địa chỉ: Nguyễn Văn Trường, P.Long Tuyền, Q.Bình Thủy, Thành phố Cần Thơ</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 Ứng Dụng Của Tôi. Đã đăng ký bản quyền.</p>
      </footer>
    </div>
  );
}

export default App;

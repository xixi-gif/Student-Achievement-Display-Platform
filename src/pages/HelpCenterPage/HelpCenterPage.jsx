import React, { useState, useEffect } from 'react';
import { Layout, Spin, Typography, Card } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { Title } = Typography;

// 图片导入
const images = import.meta.glob('../../assets/help/*.{png,jpg,jpeg,gif,svg}', {
  eager: true,
  import: 'default'
});

const ImageRenderer = ({ src, alt }) => {
  const cleanSrc = src.replace(/^\.\//, '');
  const decodedSrc = decodeURIComponent(cleanSrc);
  
  const matchedKey = Object.keys(images).find(key => {
    const fileName = key.split('/').pop();
    return fileName === decodedSrc || fileName === cleanSrc;
  });

  if (matchedKey) {
    return (
      <img
        src={images[matchedKey]}
        alt={alt || '帮助文档图片'}
        style={{
          maxWidth: '100%',
          margin: '16px auto',
          display: 'block',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}
      />
    );
  }

  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      border: '1px dashed #f5222d',
      margin: '16px 0',
      backgroundColor: '#fff6f6'
    }}>
      <p>⚠️ 图片加载失败: {decodedSrc}</p>
    </div>
  );
};

const HelpCenterPage = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        const markdownModule = await import('../../assets/help/help.md?raw');
        setMarkdownContent(markdownModule.default);
      } catch (err) {
        console.error('加载帮助文档失败:', err);
        setMarkdownContent(`# 帮助文档加载失败\n请检查 help.md 文件是否存在`);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <Content style={{ 
        padding: '24px 5%', 
        maxWidth: 1200, 
        margin: '0 auto', 
        width: '100%',
        background: '#fff'
      }}>
        <Title level={2} style={{ 
          marginBottom: 24, 
          paddingBottom: '12px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          帮助中心
        </Title>
        
        <Card 
          loading={loading} 
          bordered={false} 
          style={{ 
            minHeight: '60vh',
            padding: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
         
          <style>{`
            .compact-markdown ol, 
            .compact-markdown ul {
              margin: 8px 0 !important;
              padding-left: 20px !important;
            }
            
            .compact-markdown li {
              margin-bottom: 4px !important;
              list-style-position: outside !important;
              padding-left: 4px !important;
            }
            
            .compact-markdown li p {
              display: inline !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* 更彻底的样式重置 */
            .compact-markdown * {
              box-sizing: border-box;
            }
          `}</style>
          
          <div className="compact-markdown">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              components={{
                img: ImageRenderer,
                // 使用内联样式 + CSS 双重保障
                ol: ({ children, ...props }) => (
                  <ol style={{ 
                    margin: '4px 0',
                    paddingLeft: '2px'
                  }} {...props}>
                    {children}
                  </ol>
                ),
                ul: ({ children, ...props }) => (
                  <ul style={{ 
                    margin: '4px 0',
                    paddingLeft: '2px'
                  }} {...props}>
                    {children}
                  </ul>
                ),
                li: ({ children, ...props }) => (
                  <li style={{ 
                    margin: '2px 0',
                    padding: 0
                  }} {...props}>
                    {children}
                  </li>
                ),
                p: (props) => <p style={{ margin: '12px 0', lineHeight: '1.6' }} {...props} />,
                h2: (props) => <h2 style={{ 
                  margin: '24px 0 12px', 
                  color: '#1890ff', 
                  paddingBottom: '6px', 
                  borderBottom: '1px solid #e8e8e8' 
                }} {...props} />,
                h3: (props) => <h3 style={{ 
                  margin: '20px 0 10px', 
                  color: '#333' 
                }} {...props} />,
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default HelpCenterPage;
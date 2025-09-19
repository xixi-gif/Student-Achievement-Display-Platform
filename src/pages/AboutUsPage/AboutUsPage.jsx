import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Avatar, 
  Divider, 
  Typography, 
  Button, 
  List,
  Image,
  Layout,
  Space
} from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined
} from '@ant-design/icons';
import dazhi from '../../assets/dazhi.jpg';
import yinan from '../../assets/yinan.jpg';
import xixi from '../../assets/xixi.jpg';
import li from '../../assets/li.jpg';
import liusu from '../../assets/liusu.jpg';
import xiong from '../../assets/xiong.jpg';
import bg from '../../assets/bg2.jpg';

const { Title, Paragraph, Text } = Typography;
const { Footer } = Layout;

const AboutUsPage = () => {
  // 团队成员数据 - 修复了avatar的引用方式
  const teamMembers = [
    {
      name: '姜大志',
      role: '项目指导',
      avatar: dazhi,  
      bio: '计算机科学与技术的老师，研究方向为情感计算',
    },
    {
      name: '陈奕男',
      role: '项目指导',
      avatar: yinan, 
      bio: '计算机科学与技术的老师，研究方向为数据挖掘',
    },
    {
      name: '林嘉欣',
      role: '前端开发',
      avatar: xixi,  
      bio: '计算机科学与技术学生，擅长React和数据分析',
    },
    {
      name: '葛丽',
      role: '前端开发',
      avatar: li,    
      bio: '计算机科学与技术学生，擅长Vue3和React',
    },
    {
      name: '刘苏',
      role: '后端开发',
      avatar: liusu,  
      bio: '计算机科学与技术学生,擅长java后端开发和软件测试',
    },
    {
      name: '熊浩然',
      role: '后端开发',
      avatar: xiong,  
      bio: '计算机科学与技术学生,擅长java后端开发',
    }
  ];

  // 分离指导老师和团队成员
  const instructors = teamMembers.filter(member => member.role === '项目指导');
  const teamMembersList = teamMembers.filter(member => member.role !== '项目指导');

  // 平台特色
  const features = [
    {
      icon: <BookOutlined style={{ fontSize: 24 }} />,
      title: '多样化展示',
      description: '支持论文、项目、艺术作品等多种成果形式展示'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 24 }} />,
      title: '成就系统',
      description: '记录学生在校期间的各项成就与荣誉'
    },
    {
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      title: '社交功能',
      description: '学生之间可以相互关注、点赞和评论'
    }
  ];

  // 成员卡片组件
  const MemberCard = ({ member }) => (
    <Card
      hoverable
      cover={
        <Avatar
          size={120}
          src={member.avatar}
          style={{ margin: '20px auto', display: 'block' }}
          // 添加加载失败的容错处理
          fallback={<Text style={{ fontSize: 24 }}>{member.name.charAt(0)}</Text>}
        />
      }
    >
      <Title level={5} style={{ textAlign: 'center' }}>
        {member.name}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
        {member.role}
      </Text>
      <Paragraph style={{ textAlign: 'center', marginTop: 8 }}>
        {member.bio}
      </Paragraph>
      {member.social && (
        <div style={{ textAlign: 'center' }}>
          <Button 
            type="text" 
            icon={<GithubOutlined />} 
            href={member.social.github}
            target="_blank"
          />
          <Button 
            type="text" 
            icon={<LinkedinOutlined />} 
            href={member.social.linkedin}
            target="_blank"
          />
        </div>
      )}
    </Card>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* 页头部分 */}
      <Row justify="center" style={{ marginBottom: 40 }}>
        <Col>
          <Title level={2} style={{ textAlign: 'center' }}>
            <a href="https://www.stu.edu.cn/cmac/" target="_blank" rel="noopener noreferrer">
                关于学生成果展示平台
            </a>
          </Title>
          <Paragraph style={{ textAlign: 'center', maxWidth: 800 }}>
            我们致力于为学生提供一个展示学术成果、项目经验和创意作品的平台，
            连接校园内的优秀人才，促进学术交流与创新合作。
          </Paragraph>
        </Col>
      </Row>

      {/* 平台介绍部分 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col span={24}>
          <Card bordered={false}>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={12}>
                <Image
                  src={bg}
                  alt="学生团队工作"
                  preview={false}
                   style={{
              width: '100%',        // 自适应父容器宽度
              maxWidth: '800px',    // 最大宽度和学生团队照一致（800px）
              height: 'auto',       // 自动保持图片比例，避免拉伸变形
              borderRadius: '8px',  // 圆角和学生团队照统一，增强美观度
              objectFit: 'cover',   // 裁剪规则：保持画面核心内容，填充容器（避免画面变形）
              objectPosition: 'center'  // 裁剪时聚焦画面中心，确保主体不偏移
            }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Title level={3}>我们的使命</Title>
                <Paragraph>
                  学生成果展示平台旨在解决学生作品展示渠道有限、
                  校园内优秀成果难以被发现的问题。我们相信每个学生都有独特的才华，
                  值得被看见和认可。
                </Paragraph>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 平台特色 */}
      <Divider orientation="left">
        <Title level={4} style={{ marginBottom: 0 }}>平台特色</Title>
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        {features.map((feature, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card hoverable>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                {feature.icon}
              </div>
              <Title level={5} style={{ textAlign: 'center' }}>
                {feature.title}
              </Title>
              <Paragraph style={{ textAlign: 'center' }}>
                {feature.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 团队成员 */}
      <Divider orientation="center">
        <Title level={4} style={{ marginBottom: 0 }}>我们的团队</Title>
      </Divider>
      
      {/* 指导老师*/}
      <Row justify="center" gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {instructors.map((member, index) => (
          <Col key={index} xs={24} sm={12} md={10}>
            <MemberCard member={member} />
          </Col>
        ))}
      </Row>
      
      {/* 团队成员*/}
      <Row justify="center" gutter={[24, 24]} style={{ marginBottom: 40 }}>
        {teamMembersList.map((member, index) => (
          <Col key={index} xs={24} sm={12} md={5}>
            <MemberCard member={member} />
          </Col>
        ))}
      </Row>

      {/* 联系方式 - 优化布局 */}
      <Divider orientation="center">
        <Title level={4} style={{ marginBottom: 0 }}>联系我们</Title>
      </Divider>
      <Row justify="center" style={{ marginBottom: 40, marginTop: 20 }}>
        <Col xs={22} md={20} lg={16}>
          <Card title="联系方式" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row gutter={[16, 16]} justify="center">
                {/* 电子邮件 */}
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    backgroundColor: '#f0f2f5', 
                    margin: '0 auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: 12
                  }}>
                    <MailOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>电子邮件</Title>
                  <Text>contact@student-showcase.edu</Text>
                </Col>
                
                {/* 联系电话 */}
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    backgroundColor: '#f0f2f5', 
                    margin: '0 auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: 12
                  }}>
                    <PhoneOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>联系电话</Title>
                  <Text>+86 123 4567 8910</Text>
                </Col>
                
                {/* 办公地址 */}
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    backgroundColor: '#f0f2f5', 
                    margin: '0 auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: 12
                  }}>
                    <EnvironmentOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>办公地址</Title>
                  <Text>XX大学计算机学院3楼305室</Text>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 页脚 */}
      <Footer style={{ textAlign: 'center', marginTop: 40 }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
    </div>
  );
};

export default AboutUsPage;
    
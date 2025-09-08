import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Avatar, 
  Divider, 
  Typography, 
  Button, 
  Space,
  List,
  Image
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

const { Title, Paragraph, Text } = Typography;

const AboutUsPage = () => {
  // 团队成员数据
  const teamMembers = [
    {
      name: '张教授',
      role: '项目指导',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: '计算机科学教授，研究方向为人工智能与教育技术',
      social: {
        github: '#',
        linkedin: '#'
      }
    },
    {
      name: '李同学',
      role: '前端开发',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      bio: '计算机专业大三学生，擅长React和UI设计',
      social: {
        github: '#',
        linkedin: '#'
      }
    },
    {
      name: '王同学',
      role: '后端开发',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      bio: '软件工程专业研究生，专注于后端架构设计',
      social: {
        github: '#',
        linkedin: '#'
      }
    },
    {
      name: '赵同学',
      role: '产品设计',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      bio: '用户体验设计专业，负责平台交互设计',
      social: {
        github: '#',
        linkedin: '#'
      }
    }
  ];

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
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="学生团队工作"
                  preview={false}
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Title level={3}>我们的使命</Title>
                <Paragraph>
                  学生成果展示平台创建于2023年，旨在解决学生作品展示渠道有限、
                  校园内优秀成果难以被发现的问题。我们相信每个学生都有独特的才华，
                  值得被看见和认可。
                </Paragraph>
                <Paragraph>
                  平台目前已收录来自全校各院系的1000+个优秀作品，
                  日均访问量超过5000人次，成为校内最活跃的学术交流社区之一。
                </Paragraph>
                {/* <Space>
                  <Button type="primary">查看平台数据</Button>
                  <Button>了解更多</Button>
                </Space> */}
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
      <Divider orientation="left">
        <Title level={4} style={{ marginBottom: 0 }}>我们的团队</Title>
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        {teamMembers.map((member, index) => (
          <Col key={index} xs={24} sm={12} md={6}>
            <Card
              hoverable
              cover={
                <Avatar
                  size={120}
                  src={member.avatar}
                  style={{ margin: '20px auto', display: 'block' }}
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
            </Card>
          </Col>
        ))}
      </Row>

      {/* 联系方式 */}
      <Divider orientation="left">
        <Title level={4} style={{ marginBottom: 0 }}>联系我们</Title>
      </Divider>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="联系方式">
            <List>
              <List.Item>
                <List.Item.Meta
                  avatar={<MailOutlined />}
                  title="电子邮件"
                  description="contact@student-showcase.edu"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<PhoneOutlined />}
                  title="联系电话"
                  description="+86 123 4567 8910"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<EnvironmentOutlined />}
                  title="办公地址"
                  description="XX大学计算机学院3楼305室"
                />
              </List.Item>
            </List>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="反馈与建议">
            <Paragraph>
              我们非常重视您的意见，如果您有任何建议或遇到问题，
              请通过以下方式联系我们：
            </Paragraph>
            <Button type="primary" icon={<MailOutlined />} style={{ marginRight: 16 }}>
              发送邮件
            </Button>
            <Button icon={<GithubOutlined />} href="#" target="_blank">
              GitHub Issues
            </Button>
            <Divider />
            <Paragraph>
              关注我们的社交媒体获取最新动态：
            </Paragraph>
            <Space>
              <Button icon={<GithubOutlined />} shape="circle" />
              <Button icon={<LinkedinOutlined />} shape="circle" />
              <Button icon={<BookOutlined />} shape="circle" />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 页脚 */}
      <Divider />
      <Row justify="center">
        <Col>
          <Paragraph style={{ textAlign: 'center' }}>
            © 2023 学生成果展示平台 版权所有
          </Paragraph>
          <Paragraph type="secondary" style={{ textAlign: 'center' }}>
            由XX大学计算机学院支持开发
          </Paragraph>
        </Col>
      </Row>
    </div>
  );
};

export default AboutUsPage;
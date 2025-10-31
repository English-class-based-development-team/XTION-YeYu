/**
 * 文本输入组件测试
 * 测试发布页面的文本输入功能
 */

const { test, assertEqual, assertTrue, assertFalse, resetTestResults, printTestReport } = require('../utils/testUtils.js');
const { TEXT_LIMIT } = require('../constants/index.js');
const { validateContent } = require('../utils/validator.js');

/**
 * 模拟页面实例（用于测试文本输入逻辑）
 */
function createMockPage() {
  const page = {
    data: {
      content: '点击编辑你想分享的内容...',
      isEditingContent: false,
      contentLength: 0,
    },
    
    /**
     * 模拟点击文本卡片
     */
    onContentClick() {
      if (this.data.content === '点击编辑你想分享的内容...') {
        this.data.content = '';
        this.data.contentLength = 0;
        this.data.isEditingContent = true;
      } else {
        this.data.isEditingContent = true;
      }
    },
    
    /**
     * 模拟文本输入
     */
    onContentInput(e) {
      const value = e.detail.value;
      const trimmedValue = value.slice(0, TEXT_LIMIT.MAX_CONTENT_LENGTH);
      const length = trimmedValue.length;
      
      this.data.content = trimmedValue;
      this.data.contentLength = length;
    },
    
    /**
     * 模拟文本失焦
     */
    onContentBlur() {
      const trimmedContent = this.data.content.trim();
      if (trimmedContent.length === 0) {
        this.data.content = '点击编辑你想分享的内容...';
        this.data.contentLength = 0;
        this.data.isEditingContent = false;
      } else {
        this.data.isEditingContent = false;
      }
    },
    
    /**
     * 模拟文本聚焦
     */
    onContentFocus() {
      if (this.data.content === '点击编辑你想分享的内容...') {
        this.data.content = '';
        this.data.contentLength = 0;
      }
    },
    
    /**
     * 判断是否为占位符
     */
    isContentPlaceholder() {
      return this.data.content === '点击编辑你想分享的内容...' || this.data.content.trim().length === 0;
    },
  };
  
  return page;
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('\n开始测试：文本输入组件\n');
  resetTestResults();

  // ========== 功能测试 ==========
  
  // 测试1：点击卡片进入编辑模式
  test('测试点击卡片进入编辑模式', () => {
    const page = createMockPage();
    page.onContentClick();
    assertTrue(page.data.isEditingContent, '点击后应该进入编辑模式');
    assertEqual(page.data.content, '', '占位符应该被清空');
    assertEqual(page.data.contentLength, 0, '字数应该为0');
    return true;
  });

  // 测试2：正常文本输入
  test('测试正常文本输入', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: '这是一段测试文本' } });
    assertEqual(page.data.content, '这是一段测试文本', '内容应该正确更新');
    assertEqual(page.data.contentLength, 8, '字数应该正确统计');
    return true;
  });

  // 测试3：字数限制（300字）
  test('测试字数限制 - 300字', () => {
    const page = createMockPage();
    page.onContentClick();
    const longText = 'a'.repeat(300);
    page.onContentInput({ detail: { value: longText } });
    assertEqual(page.data.content.length, 300, '内容长度应该限制为300字');
    assertEqual(page.data.contentLength, 300, '字数统计应该正确');
    return true;
  });

  // 测试4：超长文本截断
  test('测试超长文本截断', () => {
    const page = createMockPage();
    page.onContentClick();
    const longText = 'a'.repeat(350);
    page.onContentInput({ detail: { value: longText } });
    assertEqual(page.data.content.length, 300, '超长文本应该被截断到300字');
    assertEqual(page.data.contentLength, 300, '字数统计应该为300');
    return true;
  });

  // 测试5：失焦退出编辑模式（有内容）
  test('测试失焦退出编辑模式 - 有内容', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: '测试内容' } });
    page.onContentBlur();
    assertFalse(page.data.isEditingContent, '失焦后应该退出编辑模式');
    assertEqual(page.data.content, '测试内容', '内容应该保留');
    return true;
  });

  // 测试6：失焦退出编辑模式（空内容）
  test('测试失焦退出编辑模式 - 空内容', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: '' } });
    page.onContentBlur();
    assertFalse(page.data.isEditingContent, '失焦后应该退出编辑模式');
    assertEqual(page.data.content, '点击编辑你想分享的内容...', '空内容应该恢复占位符');
    assertEqual(page.data.contentLength, 0, '字数应该为0');
    return true;
  });

  // 测试7：聚焦时清空占位符
  test('测试聚焦时清空占位符', () => {
    const page = createMockPage();
    page.onContentFocus();
    assertEqual(page.data.content, '', '占位符应该被清空');
    assertEqual(page.data.contentLength, 0, '字数应该为0');
    return true;
  });

  // 测试8：聚焦时不清空已有内容
  test('测试聚焦时不清空已有内容', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: '已有内容' } });
    page.onContentFocus();
    assertEqual(page.data.content, '已有内容', '已有内容不应该被清空');
    return true;
  });

  // 测试9：占位符判断
  test('测试占位符判断 - 占位符文本', () => {
    const page = createMockPage();
    assertTrue(page.isContentPlaceholder(), '占位符文本应该返回true');
    return true;
  });

  // 测试10：占位符判断 - 空内容
  test('测试占位符判断 - 空内容', () => {
    const page = createMockPage();
    page.data.content = '';
    assertTrue(page.isContentPlaceholder(), '空内容应该返回true');
    return true;
  });

  // 测试11：占位符判断 - 正常内容
  test('测试占位符判断 - 正常内容', () => {
    const page = createMockPage();
    page.data.content = '正常内容';
    assertFalse(page.isContentPlaceholder(), '正常内容应该返回false');
    return true;
  });

  // ========== 边界测试 ==========

  // 测试12：边界值 - 1字符
  test('测试边界值 - 1字符', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: 'a' } });
    assertEqual(page.data.content.length, 1, '1字符应该正确保存');
    assertEqual(page.data.contentLength, 1, '字数应该为1');
    return true;
  });

  // 测试13：边界值 - 299字符
  test('测试边界值 - 299字符', () => {
    const page = createMockPage();
    page.onContentClick();
    const text = 'a'.repeat(299);
    page.onContentInput({ detail: { value: text } });
    assertEqual(page.data.content.length, 299, '299字符应该正确保存');
    assertEqual(page.data.contentLength, 299, '字数应该为299');
    return true;
  });

  // 测试14：边界值 - 300字符（上限）
  test('测试边界值 - 300字符（上限）', () => {
    const page = createMockPage();
    page.onContentClick();
    const text = 'a'.repeat(300);
    page.onContentInput({ detail: { value: text } });
    assertEqual(page.data.content.length, 300, '300字符应该正确保存');
    assertEqual(page.data.contentLength, 300, '字数应该为300');
    return true;
  });

  // 测试15：包含换行符的文本
  test('测试包含换行符的文本', () => {
    const page = createMockPage();
    page.onContentClick();
    const textWithNewline = '第一行\n第二行\n第三行';
    page.onContentInput({ detail: { value: textWithNewline } });
    assertEqual(page.data.content, textWithNewline, '换行符应该正确保存');
    assertEqual(page.data.contentLength, 11, '字数应该正确统计（包括换行符）');
    return true;
  });

  // 测试16：包含空格的文本
  test('测试包含空格的文本', () => {
    const page = createMockPage();
    page.onContentClick();
    const textWithSpaces = '  测试  内容  ';
    page.onContentInput({ detail: { value: textWithSpaces } });
    assertEqual(page.data.content, textWithSpaces, '空格应该正确保存');
    // 失焦时应该保留空格（trim只用于判断是否为空）
    page.onContentBlur();
    assertEqual(page.data.content, textWithSpaces, '失焦后空格应该保留');
    return true;
  });

  // ========== 输入验证测试 ==========

  // 测试17：使用validator验证正常内容
  test('测试使用validator验证正常内容', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: '正常内容' } });
    const validation = validateContent(page.data.content);
    assertTrue(validation.valid, '正常内容应该通过验证');
    return true;
  });

  // 测试18：使用validator验证空内容
  test('测试使用validator验证空内容', () => {
    const page = createMockPage();
    page.onContentClick();
    page.onContentInput({ detail: { value: '' } });
    const validation = validateContent(page.data.content);
    assertFalse(validation.valid, '空内容应该验证失败');
    return true;
  });

  // 测试19：使用validator验证300字内容
  test('测试使用validator验证300字内容', () => {
    const page = createMockPage();
    page.onContentClick();
    const text = 'a'.repeat(300);
    page.onContentInput({ detail: { value: text } });
    const validation = validateContent(page.data.content);
    assertTrue(validation.valid, '300字内容应该通过验证');
    return true;
  });

  // 测试20：完整流程测试
  test('测试完整输入流程', () => {
    const page = createMockPage();
    
    // 初始状态
    assertEqual(page.data.content, '点击编辑你想分享的内容...', '初始状态应该是占位符');
    assertFalse(page.data.isEditingContent, '初始状态不应该在编辑模式');
    
    // 点击进入编辑
    page.onContentClick();
    assertTrue(page.data.isEditingContent, '点击后应该进入编辑模式');
    assertEqual(page.data.content, '', '占位符应该被清空');
    
    // 输入内容
    page.onContentInput({ detail: { value: '测试内容' } });
    assertEqual(page.data.content, '测试内容', '内容应该正确更新');
    assertEqual(page.data.contentLength, 4, '字数应该正确统计');
    
    // 失焦退出编辑
    page.onContentBlur();
    assertFalse(page.data.isEditingContent, '失焦后应该退出编辑模式');
    assertEqual(page.data.content, '测试内容', '内容应该保留');
    
    return true;
  });

  // 打印测试报告
  return printTestReport();
}

// 如果在页面中调用，可以直接运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
  };
}


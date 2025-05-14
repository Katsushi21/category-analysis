import React, { useState, ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  activeLink?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "WebInsight Analytics",
  activeLink,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getLinkClass = (path: string) => {
    const baseClass =
      "flex items-center px-md py-md text-text-primary hover:bg-opacity-10 hover:bg-secondary hover:text-primary";
    const activeClass =
      "bg-opacity-15 bg-secondary text-primary border-l-[3px] border-primary";

    return `${baseClass} ${activeLink === path ? activeClass : ""}`;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name='description'
          content='AIを活用したウェブサイトカテゴリ分析ツール'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap'
          rel='stylesheet'
        />
      </Head>

      {/* ヘッダー */}
      <header className='fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-border flex justify-between items-center px-lg z-50'>
        <div className='flex items-center'>
          <i className='fas fa-chart-line text-2xl text-primary mr-sm'></i>
          <span className='text-xl font-semibold text-primary'>
            WebInsight Analytics
          </span>
        </div>
      </header>

      <div className='flex min-h-[calc(100vh-60px)] mt-[60px]'>
        {/* サイドメニュー */}
        <aside
          className={`fixed top-[60px] left-0 h-[calc(100vh-120px)] bg-white shadow-md overflow-y-auto z-30 transition-all duration-300 ${
            sidebarCollapsed ? "w-[64px]" : "w-[240px]"
          }`}
        >
          <div className='py-md'>
            <ul className='list-none'>
              <li className='mb-[2px]'>
                <Link href='/' className={getLinkClass("dashboard")}>
                  <span
                    className={`${
                      sidebarCollapsed ? "mx-auto" : "mr-md"
                    } w-5 text-center`}
                  >
                    <i className='fas fa-tachometer-alt'></i>
                  </span>
                  {!sidebarCollapsed && <span>ダッシュボード</span>}
                </Link>
              </li>
              <li className='mb-[2px]'>
                <Link
                  href='/single-analysis'
                  className={getLinkClass("single-analysis")}
                >
                  <span
                    className={`${
                      sidebarCollapsed ? "mx-auto" : "mr-md"
                    } w-5 text-center`}
                  >
                    <i className='fas fa-search'></i>
                  </span>
                  {!sidebarCollapsed && <span>単一URL解析</span>}
                </Link>
              </li>
              <li className='mb-[2px]'>
                <Link
                  href='/batch-analysis'
                  className={getLinkClass("batch-analysis")}
                >
                  <span
                    className={`${
                      sidebarCollapsed ? "mx-auto" : "mr-md"
                    } w-5 text-center`}
                  >
                    <i className='fas fa-layer-group'></i>
                  </span>
                  {!sidebarCollapsed && <span>一括解析</span>}
                </Link>
              </li>
              <li className='mb-[2px]'>
                <Link href='/history' className={getLinkClass("history")}>
                  <span
                    className={`${
                      sidebarCollapsed ? "mx-auto" : "mr-md"
                    } w-5 text-center`}
                  >
                    <i className='fas fa-history'></i>
                  </span>
                  {!sidebarCollapsed && <span>解析履歴</span>}
                </Link>
              </li>
            </ul>
          </div>
          <button
            className='absolute bottom-[20px] right-md bg-primary text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer z-50'
            onClick={toggleSidebar}
          >
            <i
              className={`fas fa-chevron-${
                sidebarCollapsed ? "right" : "left"
              }`}
            ></i>
          </button>
        </aside>

        {/* メインコンテンツ */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-[64px]" : "ml-[240px]"
          } p-lg pb-[80px]`}
        >
          {children}
        </main>
      </div>

      {/* フッター */}
      <footer className='h-[60px] bg-white border-t border-border flex items-center justify-between px-lg text-xs text-gray-500 mt-auto fixed bottom-0 left-0 right-0 z-40'>
        <div>© 2025 WebInsight Analytics. All rights reserved.</div>
      </footer>
    </>
  );
};

export default Layout;

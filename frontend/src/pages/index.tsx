import React from "react";
import { NextPage } from "next";
import Layout from "@/components/common/Layout";
import Button from "@/components/common/Button";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <Layout title='WebInsight Analytics - AIでウェブサイトのカテゴリを解析'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-xl'>
          <h1 className='text-3xl md:text-4xl font-bold text-primary mb-md'>
            AIでウェブサイトのカテゴリを解析
          </h1>
          <p className='text-lg text-text-primary mb-lg'>
            WebInsight
            Analyticsは、AIを活用してウェブサイトのコンテンツを解析し、最適なカテゴリを自動判定するツールです。
            指定された URL
            に対して、メインカテゴリとサブカテゴリを判定し、結果をわかりやすく可視化します。
          </p>

          <div className='flex flex-col md:flex-row gap-md justify-center'>
            <Link href='/single-analysis'>
              <Button size='lg' icon={<i className='fas fa-search mr-sm'></i>}>
                単一URL解析を開始
              </Button>
            </Link>
            <Link href='/batch-analysis'>
              <Button
                variant='secondary'
                size='lg'
                icon={<i className='fas fa-layer-group mr-sm'></i>}
              >
                一括解析を開始
              </Button>
            </Link>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl'>
          <div className='bg-white rounded-md shadow-md p-lg text-center'>
            <div className='text-4xl text-primary mb-md'>
              <i className='fas fa-bolt'></i>
            </div>
            <h3 className='text-xl font-semibold text-primary mb-sm'>
              高速解析
            </h3>
            <p className='text-text-primary'>
              最先端のAI技術を活用し、ウェブサイトのコンテンツを素早く正確に解析します。結果は7日間キャッシュされ、再解析時間を短縮します。
            </p>
          </div>

          <div className='bg-white rounded-md shadow-md p-lg text-center'>
            <div className='text-4xl text-primary mb-md'>
              <i className='fas fa-sitemap'></i>
            </div>
            <h3 className='text-xl font-semibold text-primary mb-sm'>
              階層的カテゴリ
            </h3>
            <p className='text-text-primary'>
              メインカテゴリと最大5つのサブカテゴリを判定し、ビジネスの全体像を把握できます。
            </p>
          </div>

          <div className='bg-white rounded-md shadow-md p-lg text-center'>
            <div className='text-4xl text-primary mb-md'>
              <i className='fas fa-chart-pie'></i>
            </div>
            <h3 className='text-xl font-semibold text-primary mb-sm'>
              詳細な分析
            </h3>
            <p className='text-text-primary'>
              サービスの特徴、ターゲット層、価値提案など多角的な分析結果を提供します。
            </p>
          </div>
        </div>

        <div className='bg-white rounded-md shadow-md p-lg mb-xl'>
          <h2 className='text-2xl font-semibold text-primary mb-md'>
            使い方ガイド
          </h2>

          <div className='mb-md'>
            <h3 className='text-lg font-medium text-primary mb-sm flex items-center'>
              <i className='fas fa-search text-secondary mr-sm'></i>
              単一URL解析
            </h3>
            <p className='text-text-primary mb-sm'>
              1. 解析したいウェブサイトのURLを入力します
            </p>
            <p className='text-text-primary mb-sm'>
              2. 「分析開始」ボタンをクリックして解析を実行します
            </p>
            <p className='text-text-primary'>
              3. 解析結果ページでカテゴリ情報と詳細を確認できます
            </p>
          </div>

          <div className='mb-md'>
            <h3 className='text-lg font-medium text-primary mb-sm flex items-center'>
              <i className='fas fa-layer-group text-secondary mr-sm'></i>
              一括解析
            </h3>
            <p className='text-text-primary mb-sm'>
              1. 複数のURLが含まれたCSVファイルを用意します
            </p>
            <p className='text-text-primary mb-sm'>
              2. ファイルをアップロードして一括解析を開始します
            </p>
            <p className='text-text-primary'>
              3. すべての結果をCSVファイルとしてエクスポートできます
            </p>
          </div>

          <div className='mb-md'>
            <h3 className='text-lg font-medium text-primary mb-sm flex items-center'>
              <i className='fas fa-sync-alt text-secondary mr-sm'></i>
              キャッシュと再解析
            </h3>
            <p className='text-text-primary mb-sm'>
              1. 解析結果は7日間キャッシュされ、同じURLの再解析を高速化します
            </p>
            <p className='text-text-primary mb-sm'>
              2.
              サイトの内容が更新された場合は「キャッシュを使用しない」をオンにします
            </p>
            <p className='text-text-primary'>
              3.
              キャッシュを使用しない場合、解析に時間がかかりますがより最新の結果が得られます
            </p>
          </div>

          <div className='mb-md'>
            <h3 className='text-lg font-medium text-primary mb-sm flex items-center'>
              <i className='fas fa-history text-secondary mr-sm'></i>
              解析履歴
            </h3>
            <p className='text-text-primary mb-sm'>
              1.
              ナビゲーションメニューから「履歴」を選択して過去の解析結果を確認できます
            </p>
            <p className='text-text-primary mb-sm'>
              2. URL、ステータス、カテゴリで履歴を検索・フィルタリングできます
            </p>
            <p className='text-text-primary'>
              3. 履歴アイテムをクリックすると、詳細な解析結果を再確認できます
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

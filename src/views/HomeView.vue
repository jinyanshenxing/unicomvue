<template>
  <div class="liubang-root">
    <!-- Header Card -->
    <div class="lb-header-card">
      <div class="lb-header-top">
        <div
          class="lb-title"
          :title="packageName ? `套餐：${packageName}（点击复制 ecs_token）` : '点击复制 ecs_token'"
          @click="copyEcsToken"
        >
          {{ packageName || "流邦卡19元套餐" }}
        </div>
        <div class="lb-theme-switcher">
          <button @click="setTheme('light')" :class="['lb-theme-btn', themeMode === 'light' ? 'active' : '']" title="浅色">☀️</button>
          <button @click="setTheme('system')" :class="['lb-theme-btn', themeMode === 'system' ? 'active' : '']" title="系统">💻</button>
          <button @click="setTheme('dark')" :class="['lb-theme-btn', themeMode === 'dark' ? 'active' : '']" title="深色">🌙</button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="lb-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['lb-tab', activeTab === tab.key ? 'active' : '']"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <!-- ===== 跳点 Tab ===== -->
      <div v-if="activeTab === 'jump'" class="lb-tab-content">
        <div class="lb-jump-stats">
          <span class="lb-jump-red">跳点: {{ jumpBytes }}</span>
          <span class="lb-jump-green">免流: {{ freeBytes }}</span>
        </div>
        <div class="lb-uptime">{{ uptimeText }}</div>

        <div v-if="isLoading" class="lb-loading-bar">
          <div class="lb-loading-inner"></div>
        </div>

        <div class="lb-section-divider">--------本次 {{ currentSessionTime }}--------</div>
        <template v-if="ocsData">
          <div class="lb-data-row"><span class="lb-data-label">通　　用：</span><span class="lb-data-green">{{ generalTotal }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">已用通用：</span><span class="lb-data-green">{{ generalUsed }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">剩余通用：</span><span class="lb-data-green">{{ generalRemain }}</span></div>
          <div class="lb-divider-line"></div>
          <div class="lb-data-row"><span class="lb-data-label">定　　向：</span><span class="lb-data-green">{{ directedTotal }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">已用定向：</span><span class="lb-data-green">{{ directedUsed }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">剩余定向：</span><span class="lb-data-green">{{ directedRemain }}</span></div>
          <div class="lb-divider-line"></div>
          <div class="lb-data-row"><span class="lb-data-label">公　　免：</span><span class="lb-data-green">{{ pubFree }}</span></div>
        </template>
        <div v-else class="lb-empty-hint">暂无数据，请刷新</div>

        <div class="lb-section-divider">--------上次 {{ lastSessionTime }}--------</div>
        <template v-if="prevOcsData">
          <div class="lb-data-row"><span class="lb-data-label">通　　用：</span><span class="lb-data-green">{{ prevGeneralTotal }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">已用通用：</span><span class="lb-data-green">{{ prevGeneralUsed }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">剩余通用：</span><span class="lb-data-green">{{ prevGeneralRemain }}</span></div>
          <div class="lb-divider-line"></div>
          <div class="lb-data-row"><span class="lb-data-label">定　　向：</span><span class="lb-data-green">{{ prevDirectedTotal }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">已用定向：</span><span class="lb-data-green">{{ prevDirectedUsed }}</span></div>
          <div class="lb-data-row"><span class="lb-data-label">剩余定向：</span><span class="lb-data-green">{{ prevDirectedRemain }}</span></div>
          <div class="lb-divider-line"></div>
          <div class="lb-data-row"><span class="lb-data-label">公　　免：</span><span class="lb-data-green">{{ prevPubFree }}</span></div>
        </template>
        <div v-else class="lb-empty-hint" style="padding:8px 0;">暂无上次数据</div>

        <button class="lb-reset-btn" @click="resetHistory">重置</button>
      </div>

      <!-- ===== 详情 Tab ===== -->
      <div v-if="activeTab === 'detail'" class="lb-tab-content">
        <template v-if="ocsData">
          <div class="lb-detail-section">
            <div class="lb-detail-title">流量</div>
            <div class="lb-detail-summary-row">
              <div>
                <div class="lb-detail-label">已用</div>
                <div class="lb-detail-big-red">{{ totalUsedFlow }}</div>
              </div>
              <div>
                <div class="lb-detail-label">已免</div>
                <div class="lb-detail-big-orange">{{ totalFreeFlow }}</div>
              </div>
            </div>

            <div v-for="card in detailCards" :key="card.title" class="lb-pkg-item">
              <div class="lb-pkg-name">{{ card.title }}</div>
              <div class="lb-pkg-bar-wrap">
                <div class="lb-pkg-bar-bg">
                  <div
                    class="lb-pkg-bar-fill"
                    :class="card.percent >= 100 ? 'lb-bar-full' : 'lb-bar-normal'"
                    :style="{ width: Math.min(card.percent || 0, 100) + '%' }"
                  ></div>
                </div>
                <span v-if="card.percent >= 100" class="lb-bar-pct lb-pct-red">100.00%</span>
                <span v-else-if="card.percent > 0" class="lb-bar-pct">{{ card.percent?.toFixed(2) }}%</span>
                <span v-else class="lb-bar-pct">0.00%</span>
              </div>
              <div class="lb-pkg-meta">
                <span class="lb-pkg-remain">剩余{{ card.remain }}/总量{{ card.total }}</span>
                <span class="lb-pkg-used">已用{{ card.used }}</span>
              </div>
            </div>
          </div>

          <div class="lb-detail-section lb-mt">
            <div class="lb-detail-title">语音</div>
            <div v-for="vc in voiceCards" :key="vc.title" class="lb-pkg-item">
              <div class="lb-pkg-name">{{ vc.title }}</div>
              <div class="lb-pkg-bar-wrap">
                <div class="lb-pkg-bar-bg">
                  <div class="lb-pkg-bar-fill lb-bar-normal" :style="{ width: (vc.percent || 0) + '%' }"></div>
                </div>
                <span class="lb-bar-pct">{{ (vc.percent || 0).toFixed(2) }}%</span>
              </div>
              <div class="lb-pkg-meta">
                <span class="lb-pkg-remain">剩余{{ vc.remain }}/总量{{ vc.total }}</span>
                <span class="lb-pkg-used">已用{{ vc.used }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="lb-empty-hint">暂无数据，请刷新</div>
      </div>

      <!-- ===== 分析 Tab ===== -->
      <div v-if="activeTab === 'analysis'" class="lb-tab-content">
        <div class="lb-analysis-info">
          <div class="lb-info-row">
            <span class="lb-info-label">状态：</span>
            <span class="lb-info-val" :class="dotKind === 'ok' ? 'lb-green' : dotKind === 'error' ? 'lb-red' : ''">{{ statusText }}</span>
          </div>
          <div class="lb-info-row">
            <span class="lb-info-label">速率：</span>
            <span class="lb-info-val">{{ signedRate }}</span>
          </div>
          <div class="lb-info-row">
            <span class="lb-info-label">QCI：</span>
            <span class="lb-info-val">{{ qciLevel }}</span>
          </div>
          <div class="lb-info-row" v-if="hasLimitService">
            <span class="lb-info-label">限速：</span>
            <span class="lb-info-val lb-red">已检测到限速服务(50027)</span>
          </div>
          <div class="lb-info-row">
            <span class="lb-info-label">刷新：</span>
            <span class="lb-info-val">{{ lastAt }}</span>
          </div>
        </div>
        <div class="lb-analysis-cards" v-html="cardsHtml" v-show="!showEmpty"></div>
        <div class="lb-empty-hint" v-show="showEmpty">暂无可展示的数据</div>
      </div>

      <!-- ===== 推送 Tab ===== -->
      <div v-if="activeTab === 'push'" class="lb-tab-content">
        <div class="lb-push-hint">推送功能请在配置中设置阈值与频率，满足条件后自动提醒。</div>
        <div class="lb-info-row"><span class="lb-info-label">上次刷新：</span><span class="lb-info-val">{{ lastAt }}</span></div>
        <div class="lb-info-row"><span class="lb-info-label">刷新间隔：</span><span class="lb-info-val">30秒</span></div>
        <div class="lb-info-row"><span class="lb-info-label">暂停状态：</span><span class="lb-info-val">{{ paused ? '已暂停' : '运行中' }}</span></div>
      </div>

      <!-- ===== 配置 Tab ===== -->
      <div v-if="activeTab === 'config'" class="lb-tab-content">
        <div class="lb-config-section">
          <div class="lb-config-title">消息推送</div>
          <label class="lb-checkbox-row">
            <input type="checkbox" v-model="notifyJump" class="lb-checkbox" />
            <span>跳点提醒</span>
          </label>
          <label class="lb-checkbox-row">
            <input type="checkbox" v-model="notifyExpire" class="lb-checkbox" />
            <span>失效提醒</span>
          </label>
        </div>
        <div class="lb-config-section">
          <div class="lb-config-title">副卡配置</div>
          <label class="lb-checkbox-row">
            <input type="checkbox" v-model="subCardOnly" class="lb-checkbox" />
            <span>只统计当前卡信息</span>
          </label>
        </div>
        <div class="lb-config-section">
          <div class="lb-config-title">新密码</div>
          <input type="password" v-model="newPassword" class="lb-input" placeholder="输入新密码(不修改请留空)" />
        </div>
        <div class="lb-config-section">
          <div class="lb-config-title">跳点阈值 <span class="lb-required">*</span></div>
          <div class="lb-number-row">
            <input type="number" v-model.number="jumpThreshold" class="lb-input lb-number-input" />
            <span class="lb-unit">MB</span>
            <button class="lb-num-btn" @click="jumpThreshold = Math.max(1, jumpThreshold - 1)">－</button>
            <button class="lb-num-btn" @click="jumpThreshold++">＋</button>
          </div>
        </div>
        <div class="lb-config-section">
          <div class="lb-config-title">监控频率 <span class="lb-required">*</span></div>
          <div class="lb-number-row">
            <input type="number" v-model.number="monitorFreq" class="lb-input lb-number-input" />
            <span class="lb-unit">秒</span>
            <button class="lb-num-btn" @click="monitorFreq = Math.max(30, monitorFreq - 10)">－</button>
            <button class="lb-num-btn" @click="monitorFreq += 10">＋</button>
          </div>
        </div>
        <button class="lb-modify-btn" @click="saveConfig">修改</button>
      </div>

      <!-- ===== 捐赠 Tab ===== -->
      <div v-if="activeTab === 'donate'" class="lb-tab-content">
        <div class="lb-donate-hint">如果这个工具对你有帮助，欢迎捐赠支持开发者继续维护。</div>
        <div class="lb-donate-links">
          <a href="https://github.com/AliYa-chen/unicomvue" target="_blank" class="lb-donate-link">⭐ GitHub 点个 Star</a>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="lb-action-bar">
      <button class="lb-action-btn lb-btn-refresh" :disabled="isLoading" @click="fetchData">
        {{ isLoading ? '刷新中…' : '刷新' }}
        <span v-show="isLoading" class="lb-spin"></span>
      </button>
      <button class="lb-action-btn lb-btn-pause" @click="togglePause">{{ paused ? "继续" : "暂停" }}</button>
      <button class="lb-action-btn lb-btn-logout" @click="logout">退出</button>
    </div>

    <!-- Login Modal -->
    <div class="lb-modal-overlay" v-show="loginModal">
      <div class="lb-modal">
        <div class="lb-modal-header">
          <div>
            <div class="lb-modal-title">登录</div>
            <div class="lb-modal-subtitle">请输入手机号与短信验证码</div>
          </div>
          <span class="lb-modal-icon">🔐</span>
        </div>

        <div class="lb-mode-tabs">
          <button :class="['lb-mode-tab', loginMode === 'sms' ? 'active' : '']" @click="switchLoginMode('sms')" type="button">手机 + 验证码</button>
          <button :class="['lb-mode-tab', loginMode === 'token' ? 'active' : '']" @click="switchLoginMode('token')" type="button">直接输入 token</button>
        </div>

        <template v-if="loginMode === 'sms'">
          <div class="lb-form-group">
            <div class="lb-form-label">手机号</div>
            <input v-model.trim="loginPhone" inputmode="numeric" maxlength="11" class="lb-form-input" placeholder="11位手机号" />
          </div>
          <div class="lb-form-group">
            <div class="lb-form-label">短信验证码</div>
            <div class="lb-sms-row">
              <input ref="codeInputRef" v-model.trim="loginCode" inputmode="numeric" maxlength="6" class="lb-form-input" placeholder="6位验证码" @keydown.enter="doLogin" />
              <button type="button" class="lb-sms-btn" :disabled="smsLoading || smsCountdown > 0 || !isValidPhone" @click="handleSendCode()">
                {{ smsLoading ? '发送中...' : (smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码') }}
              </button>
            </div>
          </div>
          <button class="lb-login-btn" :disabled="loginLoading" @click="doLogin" type="button">
            <span>{{ loginLoading ? "正在登录…" : "立即登录" }}</span>
            <span class="lb-spin" v-show="loginLoading"></span>
          </button>
        </template>

        <template v-else>
          <div class="lb-form-group">
            <div class="lb-form-label">ecs_token</div>
            <textarea v-model.trim="loginToken" rows="4" class="lb-form-input lb-textarea" placeholder="粘贴你的 ecs_token（会写入本地缓存）"></textarea>
          </div>
          <button class="lb-login-btn" @click="applyTokenLogin" type="button">使用该 ecs_token 登录</button>
        </template>

        <div class="lb-msg" v-show="loginMsg" :class="loginMsgKind === 'ok' ? 'lb-msg-ok' : 'lb-msg-err'">{{ loginMsg }}</div>

        <div class="lb-privacy-tip">
          提示：点击登录即表示您同意本工具获取您的 <code>ecs_token</code>，仅用于查询您本人联通账号信息。
          <button type="button" class="lb-privacy-link" @click="openPrivacy && openPrivacy()">详细请看隐私协议</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, inject, nextTick } from "vue";

// ========= 配置 =========
const MAIN_API = "https://networkapi.2t.hk";
const STORAGE_KEY = "ecs_token";
const PHONE_HISTORY_KEY = "last_used_phone";
const THEME_KEY = "theme";
const LOGIN_API = MAIN_API + "/gettoken";
const OCS_API = MAIN_API + "/ocs_proxy";
const BASIC_API = MAIN_API + "/basicdata_proxy";
const QCI_API = MAIN_API + "/qci_proxy";
const INTERVAL_MS = 30_000;
const CAPTCHA_APPID = "195809716";
const ECS_ACC = "sGPt3BqyB6Z8STGQtqwLkkapYkz97jot5FVcLTq2IuxlXuBzS1vqZlKEe9Ac4QHJBkBAZYrKQKZyUhWatBMozAVYOL1Wd7sO/hXwCTggEcCFgpgaBytbG99HN3xavOGbeDtTZGV7eiBYSsQNhJ3wRvnvN2PKXFzBLhPa8i0j8Gs=";

// ========= Tab =========
const tabs = [
  { key: 'jump', label: '跳点' },
  { key: 'detail', label: '详情' },
  { key: 'analysis', label: '分析' },
  { key: 'push', label: '推送' },
  { key: 'config', label: '配置' },
  { key: 'donate', label: '捐赠' },
];
const activeTab = ref('jump');

// ========= Config State =========
const notifyJump = ref(true);
const notifyExpire = ref(true);
const subCardOnly = ref(true);
const newPassword = ref('');
const jumpThreshold = ref(5);
const monitorFreq = ref(180);
function saveConfig() { /* persist config locally */ }

// ========= UI State =========
const loginMode = ref("sms");
const loginToken = ref("");
const statusText = ref("准备中…");
const dotKind = ref("info");
const isLoading = ref(false);
const lastAt = ref("—");
const signedRate = ref("—");
const qciLevel = ref("—");
const cardsHtml = ref("");
const showEmpty = ref(false);
const paused = ref(false);
let timer = null;
const packageName = ref("");
const hasLimitService = ref(false);
const maxNetMbps = ref(null);
const basicIsLte = ref(false);
const openPrivacy = inject("openPrivacy");

// ========= OCS Data for Tabs =========
const ocsData = ref(null);
const prevOcsData = ref(null);
const currentSessionTime = ref("—");
const lastSessionTime = ref("—");
const uptimeText = ref("—");
const jumpBytes = ref("0KB");
const freeBytes = ref("0KB");

// 跳点 tab computed
const generalTotal = computed(() => extractFlow(ocsData.value, 'general', 'total'));
const generalUsed = computed(() => extractFlow(ocsData.value, 'general', 'used'));
const generalRemain = computed(() => extractFlow(ocsData.value, 'general', 'remain'));
const directedTotal = computed(() => extractFlow(ocsData.value, 'directed', 'total'));
const directedUsed = computed(() => extractFlow(ocsData.value, 'directed', 'used'));
const directedRemain = computed(() => extractFlow(ocsData.value, 'directed', 'remain'));
const pubFree = computed(() => '0KB');

const prevGeneralTotal = computed(() => extractFlow(prevOcsData.value, 'general', 'total'));
const prevGeneralUsed = computed(() => extractFlow(prevOcsData.value, 'general', 'used'));
const prevGeneralRemain = computed(() => extractFlow(prevOcsData.value, 'general', 'remain'));
const prevDirectedTotal = computed(() => extractFlow(prevOcsData.value, 'directed', 'total'));
const prevDirectedUsed = computed(() => extractFlow(prevOcsData.value, 'directed', 'used'));
const prevDirectedRemain = computed(() => extractFlow(prevOcsData.value, 'directed', 'remain'));
const prevPubFree = computed(() => '0KB');

// 详情 tab computed
const totalUsedFlow = computed(() => ocsData.value ? formatFlowFromMB(getTotalUsed(ocsData.value)) : '—');
const totalFreeFlow = computed(() => ocsData.value ? formatFlowFromMB(getTotalFree(ocsData.value)) : '—');
const detailCards = computed(() => ocsData.value ? buildDetailCards(ocsData.value) : []);
const voiceCards = computed(() => ocsData.value ? buildVoiceCards(ocsData.value) : []);

function extractFlow(data, type, field) {
  if (!data) return '—';
  const flowRes = mergeBlock(data, 0);
  if (!flowRes) return '—';
  const ft = type === 'general' ? '1' : type === 'directed' ? '2' : null;
  if (!ft) return '0KB';
  const d = flowRes.details?.find(d => String(d?.flowType) === ft && String(d?.elemType) === '3');
  if (!d) return '—';
  const used = toNum(d?.use) ?? 0;
  const total = toNum(d?.total) ?? 0;
  const remain = toNum(d?.remain) ?? 0;
  if (field === 'used') return formatFlowFromMB(used);
  if (field === 'total') return formatFlowFromMB(total);
  if (field === 'remain') return formatFlowFromMB(remain);
  return '—';
}

function getTotalUsed(data) {
  const flowRes = mergeBlock(data, 0);
  if (!flowRes?.details) return 0;
  return flowRes.details.filter(d => String(d?.elemType) === '3').reduce((s, d) => s + (toNum(d?.use) ?? 0), 0);
}

function getTotalFree(data) {
  const flowRes = mergeBlock(data, 0);
  if (!flowRes?.details) return 0;
  return flowRes.details.filter(d => String(d?.elemType) === '3' && String(d?.limited) === '1').reduce((s, d) => s + (toNum(d?.use) ?? 0), 0);
}

function buildDetailCards(data) {
  const flowRes = mergeBlock(data, 0);
  if (!flowRes?.details) return [];
  return flowRes.details.filter(d => String(d?.elemType) === '3' && d?.hide !== true).map(d => {
    const used = toNum(d?.use) ?? 0;
    const total = toNum(d?.total);
    const remain = toNum(d?.remain) ?? 0;
    const unlimited = String(d?.limited) === '1';
    const pct = unlimited ? 100 : (total > 0 ? clamp((used / total) * 100, 0, 100) : 0);
    return {
      title: d?.feePolicyName?.trim() || flowTypeLabel(String(d?.flowType ?? '')),
      used: formatFlowFromMB(used),
      total: total !== null ? formatFlowFromMB(total) : '∞',
      remain: formatFlowFromMB(remain),
      percent: pct,
    };
  });
}

function buildVoiceCards(data) {
  const voiceRes = mergeBlock(data, 1);
  if (!voiceRes) return [];
  const { used, remain, total } = getAgg(voiceRes);
  const pct = total > 0 ? clamp((used / total) * 100, 0, 100) : 0;
  return [{
    title: '合作产品套餐A',
    used: formatMinutes(used),
    total: formatMinutes(total),
    remain: formatMinutes(remain),
    percent: pct,
  }];
}

// ========= Theme =========
const themeMode = ref('system');
let mediaQueryList = null;

function applyTheme() {
  const isSystem = themeMode.value === 'system';
  const systemDark = mediaQueryList && mediaQueryList.matches;
  const shouldBeDark = themeMode.value === 'dark' || (isSystem && systemDark);
  if (shouldBeDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}
function setTheme(mode) { themeMode.value = mode; localStorage.setItem(THEME_KEY, mode); applyTheme(); }
function onSystemThemeChange() { if (themeMode.value === 'system') applyTheme(); }
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  themeMode.value = (saved && ['light', 'dark', 'system'].includes(saved)) ? saved : 'system';
  applyTheme();
}

// ========= Login =========
const loginModal = ref(false);
const loginPhone = ref(localStorage.getItem(PHONE_HISTORY_KEY) || "");
const loginCode = ref("");
const loginLoading = ref(false);
const loginMsg = ref("");
const loginMsgKind = ref("error");
const smsLoading = ref(false);
const smsCountdown = ref(0);
const codeInputRef = ref(null);
const currentAppId = ref("");
const isValidPhone = computed(() => /^1\d{10}$/.test(loginPhone.value));

// ========= Helpers =========
function setStatus(text, kind = "info") { statusText.value = text || ""; dotKind.value = kind; }
function pad(n) { return String(n).padStart(2, "0"); }
function setLastAtNow() {
  const d = new Date();
  const fmt = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  lastAt.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (currentSessionTime.value !== "—") lastSessionTime.value = currentSessionTime.value;
  currentSessionTime.value = fmt;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function looksLikeHtml(t) { return (t || "").trim().slice(0, 200).toLowerCase().startsWith("<"); }
function escapeHtml(s) { return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function toNum(v) { const n = Number(String(v ?? "").trim()); return Number.isFinite(n) ? n : null; }
function formatRateMbps(v) { if (v === "LTE") return "LTE"; const n = toNum(v); return (n === null || n <= 0) ? "—" : `${Math.round(n)}Mbps`; }
function formatQciNum(v) { const n = toNum(v); return n === null ? "—" : `${Math.round(n)}`; }
function formatFlowFromMB(mb) {
  const n = toNum(mb);
  if (n === null) return "—";
  if (n === 0) return "0KB";
  if (n >= 1024) return (n / 1024).toFixed(2) + "GB";
  return n.toFixed(2) + "MB";
}
function formatMinutes(v) { const n = toNum(v); return n === null ? "—" : String(Math.round(n)) + "分钟"; }
function getEcsToken() { return localStorage.getItem(STORAGE_KEY) || ""; }
function setEcsToken(token) { localStorage.setItem(STORAGE_KEY, token); }
function clearEcsToken() { localStorage.removeItem(STORAGE_KEY); }

function handleCommonErrors(json, httpStatus) {
  if (json?.code === 'BLACKLIST' || (json?.raw === '999997')) {
    clearEcsToken(); setStatus("账号被限制(黑名单)，请稍后重试", "error"); showLogin();
    loginMsg.value = "您的账号被联通限制 (999997)"; loginMsgKind.value = "error"; return true;
  }
  if (json?.code === 'TOKEN_EXPIRED' || httpStatus === 401 || (json?.code === 'UPSTREAM_NON_JSON' && /99999[89]/.test(json?.raw))) {
    clearEcsToken(); setStatus("Token 已失效，请重新登录", "error"); showLogin(); return true;
  }
  return false;
}

// Icons (green themed)
const ICON_PHONE = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6.5 3.5l3 2.2c.6.4.8 1.2.4 1.8l-1.2 1.8c-.2.3-.2.7-.1 1.1.8 2.1 2.5 3.8 4.6 4.6.4.1.8.1 1.1-.1l1.8-1.2c.6-.4 1.4-.2 1.8.4l2.2 3c.4.6.3 1.4-.2 1.9l-1.4 1.4c-.6.6-1.5.9-2.4.8-7.1-.8-12.8-6.5-13.6-13.6-.1-.9.2-1.8.8-2.4L4.6 3.7c.5-.5 1.3-.6 1.9-.2Z" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_DATA = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M6 11h12M8 15h8M10 19h4" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const ICON_SMS = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M7 8h10M7 12h6M21 12c0 4.418-4.03 8-9 8a10.5 10.5 0 0 1-3.1-.46L3 20l1.2-3.2A7.4 7.4 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function pickByIndex(arr, idx) { return Array.isArray(arr) && arr.length > idx ? arr[idx] : null; }
function normalizeDetails(arr) { return Array.isArray(arr) ? arr.filter(Boolean) : []; }
function detailKey(d) { return d?.feePolicyId ? `feePolicyId:${d.feePolicyId}` : `mix:${d?.addupItemCode}|${d?.feePolicyName}|${d?.endDate}|${d?.flowType}|${d?.total}`; }
function mergeDetails(a, b) { const out = [], seen = new Set(); [...normalizeDetails(a), ...normalizeDetails(b)].forEach(d => { const k = detailKey(d); if (!seen.has(k)) { seen.add(k); out.push(d); } }); return out; }
function mergeBlock(json, idx) { const m = mergeDetails(pickByIndex(json?.resources, idx)?.details, pickByIndex(json?.unshared, idx)?.details); return m.length ? { ...json?.unshared?.[idx], ...json?.resources?.[idx], details: m } : null; }
function flowTypeLabel(ft) { return ft==="1"?"通用流量":ft==="2"?"专属流量":ft==="3"?"其他流量":ft?`流量(${ft})`:"流量"; }
function flowTypeRank(k) { return k==="1"?1:k==="2"?2:k==="3"?3:9; }
function getAgg(res) { const used = toNum(res?.userResource) ?? 0, remain = Math.max(0, toNum(res?.remainResource) ?? 0); return { used, remain, total: used + remain }; }

function buildCardsFromOcs(json) {
  const cards = [];
  const flowRes = mergeBlock(json, 0), voiceRes = mergeBlock(json, 1), smsRes = mergeBlock(json, 2);
  if (voiceRes) {
    const { used, remain, total } = getAgg(voiceRes);
    const percent = total > 0 ? clamp((used / total) * 100, 0, 100) : null;
    cards.push({ kind: "voice", title: "语音", subtitle: "（已用）", mainValue: formatMinutes(used), smallTotal: `总：${formatMinutes(total)}`, unlimited: false, percent, canUseText: `剩：${formatMinutes(remain)}` });
  }
  if (smsRes) {
    const { used, remain, total } = getAgg(smsRes);
    const percent = total > 0 ? clamp((used / total) * 100, 0, 100) : null;
    cards.push({ kind: "sms", title: "短信", subtitle: "（已用）", mainValue: `${Math.round(used)}条`, smallTotal: `总：${Math.round(total)}`, unlimited: false, percent, canUseText: `剩：${Math.round(remain)}` });
  }
  if (flowRes) {
    flowRes.details.filter(d => String(d?.elemType) === "3" && d?.hide !== true).forEach(d => {
      const unlimited = String(d?.limited) === "1";
      const ft = String(d?.flowType ?? "").trim();
      const use = toNum(d?.use) ?? 0, total = toNum(d?.total), remain = toNum(d?.remain);
      const percent = unlimited ? 100 : (total > 0 ? clamp((use / total) * 100, 0, 100) : (use + (remain || 0) > 0 ? clamp((use / (use + (remain || 0))) * 100, 0, 100) : null));
      const badges = [
        { text: ft==="1"?"通用":ft==="2"?"专属":ft==="3"?"其他":"未知", cls: "" },
        { text: unlimited ? "无限量" : "有上限", cls: unlimited ? "badge-amber" : "" }
      ].filter(Boolean);
      cards.push({ kind: "flow", title: d?.feePolicyName?.trim() || flowTypeLabel(ft), mainValue: formatFlowFromMB(use), smallTotal: unlimited ? "总量：∞" : (total !== null ? `总：${formatFlowFromMB(total)}` : "总量：—"), unlimited, percent, canUseText: unlimited ? "" : `剩：${remain === null ? "—" : formatFlowFromMB(remain)}`, hideCanUseLine: unlimited, badges, flowTypeRank: flowTypeRank(ft), flowLimitedKey: unlimited ? 0 : 1 });
    });
  }
  return cards.sort((a, b) => {
    const x = (a.kind==="voice"?0:a.kind==="sms"?5:1000+(a.flowTypeRank??9)*100+(a.flowLimitedKey??1)*10) -
              (b.kind==="voice"?0:b.kind==="sms"?5:1000+(b.flowTypeRank??9)*100+(b.flowLimitedKey??1)*10);
    return x || String(a.title).localeCompare(String(b.title), "zh-CN");
  });
}

function makeOcsCard(card) {
  const unlimited = !!card.unlimited;
  const percent = unlimited ? 100 : (card.percent || 0);
  const barStyle = unlimited
    ? 'background:repeating-linear-gradient(90deg,#ef4444 0%,#f97316 16%,#eab308 33%,#22c55e 50%,#3b82f6 66%,#8b5cf6 83%,#ef4444 100%);background-size:240px 100%;animation:lb-rainbow 1.8s linear infinite;'
    : `background:#16a34a;`;
  const iconSvg = card.kind === "voice" ? ICON_PHONE : card.kind === "sms" ? ICON_SMS : ICON_DATA;

  const badgesHtml = card.kind === "flow" && card.badges?.length
    ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:5px;">${card.badges.map(b => `<span style="display:inline-flex;align-items:center;border-radius:999px;border:1px solid #bbf7d0;padding:1px 8px;font-size:11px;background:#f0fdf4;color:#15803d;">${escapeHtml(b.text)}</span>`).join("")}</div>`
    : "";

  const unlimitedBadge = unlimited
    ? `<div style="position:absolute;right:-6px;top:-6px;background:#16a34a;color:#fff;border-radius:999px;padding:1px 7px;font-size:11px;font-weight:700;">∞</div>`
    : "";

  return `<div class="lb-ocs-card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
      <div style="min-width:0;flex:1;">
        <div style="font-size:13px;color:#666;font-weight:500;">${escapeHtml(card.title)} ${escapeHtml(card.subtitle||"")}</div>
        <div style="margin-top:6px;font-size:26px;font-weight:700;color:#111;">${escapeHtml(card.mainValue)}</div>
        <div style="margin-top:3px;font-size:12px;color:#999;">${escapeHtml(card.smallTotal||"")}</div>
        <div style="margin-top:2px;font-size:12px;color:#999;${card.hideCanUseLine?'visibility:hidden;':''}">${escapeHtml(card.canUseText||"")}</div>
        ${badgesHtml}
      </div>
      <div style="position:relative;flex-shrink:0;">
        <div style="border-radius:10px;background:#f0fdf4;padding:8px;">${iconSvg}</div>
        ${unlimitedBadge}
      </div>
    </div>
    <div style="margin-top:14px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#999;margin-bottom:5px;">
        <span>总量</span>
        <span>${unlimited ? "无限量" : percent === null ? "—" : percent.toFixed(2) + "%"}</span>
      </div>
      <div style="height:7px;width:100%;background:#f0f0f0;border-radius:999px;overflow:hidden;">
        <div style="height:100%;border-radius:999px;width:${Math.min(percent||0,100)}%;${barStyle}"></div>
      </div>
    </div>
  </div>`;
}

function renderFromOcs(json) {
  if (json?.code && String(json.code) !== "0000") throw new Error(`Code ${json.code}`);
  packageName.value = String(json?.packageName || json?.result?.packageName || "").trim();

  prevOcsData.value = ocsData.value;
  ocsData.value = json;
  freeBytes.value = formatFlowFromMB(getTotalFree(json));

  const cards = buildCardsFromOcs(json);
  if (!cards.length) { showEmpty.value = true; cardsHtml.value = ""; return; }
  showEmpty.value = false;

  const unl = cards.filter(c => c.kind==="flow" && c.unlimited);
  const lim = cards.filter(c => c.kind==="flow" && !c.unlimited);
  const oth = cards.filter(c => c.kind!=="flow");

  let html = `<style>@keyframes lb-rainbow{from{background-position:0 0}to{background-position:240px 0}}</style>`;
  html += [...oth, ...unl].map(makeOcsCard).join("");

  if (lim.length === 1) {
    html += makeOcsCard(lim[0]);
  } else if (lim.length > 1) {
    html += `<div data-flow-wrapper="1" style="grid-column:1/-1;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="font-size:13px;font-weight:500;color:#333;">其他流量包 (${lim.length})</div>
        <button type="button" data-flow-group-toggle="1" aria-expanded="false" style="font-size:12px;color:#16a34a;background:none;border:none;cursor:pointer;font-weight:500;">展开</button>
      </div>
      <div data-flow-group="1" data-collapsed="1">
        <div class="lb-ocs-grid flow-group-grid">${lim.map(makeOcsCard).join("")}</div>
      </div>
    </div>`;
  }
  cardsHtml.value = html;
}

// ========= API =========
async function fetchData() {
  const ecs_token = getEcsToken();
  if (!ecs_token) { setStatus("未登录", "error"); showLogin(); return; }
  isLoading.value = true;
  setStatus("请求中…", "info");
  try {
    const r = await fetch(OCS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ecs_token, ecs_acc: ECS_ACC }) });
    const t = await r.text();
    if (looksLikeHtml(t)) throw new Error("API返回HTML");
    let j;
    try { j = JSON.parse(t); } catch { throw new Error("响应非JSON"); }
    if (handleCommonErrors(j, r.status)) { isLoading.value = false; return; }
    if (j?.ok === false || (j?.code && j.code !== "0000")) throw new Error(j?.msg || "查询失败");
    renderFromOcs(j);
    await fetchBasicDataAndRenderRate();
    await fetchQciAndRender();
    setLastAtNow();
    setStatus("已刷新", "ok");
  } catch (e) {
    setStatus(e.message, "error");
  } finally {
    isLoading.value = false;
  }
}

async function fetchBasicDataAndRenderRate() {
  const t = getEcsToken(); if (!t) return;
  try {
    const r = await fetch(BASIC_API, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ ecs_token: t, ecs_acc: ECS_ACC }) });
    const j = await r.json();
    if (handleCommonErrors(j, r.status)) return;
    if (j.code === "0000") {
      basicIsLte.value = (j?.rate_is_lte === true);
      if (typeof j?.rate_mbps === "number" && j.rate_mbps > 0) { signedRate.value = formatRateMbps(j.rate_mbps); return; }
      if (basicIsLte.value) { signedRate.value = "LTE"; return; }
      signedRate.value = "—";
    }
  } catch {}
}

async function fetchQciAndRender() {
  const t = getEcsToken(); if (!t) return;
  try {
    const r = await fetch(QCI_API, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ ecs_token: t, ecs_acc: ECS_ACC }) });
    const j = await r.json();
    if (handleCommonErrors(j, r.status)) return;
    if (j.code === "0000") {
      qciLevel.value = formatQciNum(j.qci_num);
      hasLimitService.value = (j?.has_limit_service === true);
      maxNetMbps.value = (typeof j?.max_net_mbps === "number" && j.max_net_mbps > 0) ? j.max_net_mbps : null;
      if (basicIsLte.value && maxNetMbps.value) signedRate.value = formatRateMbps(maxNetMbps.value);
    }
  } catch {}
}

// ========= SMS & Login =========
function generateAppId() {
  const rnd = () => String(Math.floor(Math.random() * 10));
  return rnd()+"f"+rnd()+"af"+rnd()+rnd()+"ad"+rnd()+"912d306b5053abf90c7ebbb695887bc"+"870ae0706d573c348539c26c5c0a878641fcc0d3e90acb9be1e6ef858a"+"59af546f3c826988332376b7d18c8ea2398ee3a9c3db947e2471d32a49612";
}
function startSmsCountdown() {
  smsCountdown.value = 60;
  const t = setInterval(() => { smsCountdown.value--; if (smsCountdown.value <= 0) clearInterval(t); }, 1000);
}
function loadScript() {
  return new Promise((resolve) => {
    if (window.TencentCaptcha) return resolve();
    const s = document.createElement('script'); s.src = 'https://turing.captcha.qcloud.com/TJCaptcha.js'; s.onload = resolve; document.head.appendChild(s);
  });
}
async function handleSendCode(resultToken = "") {
  if (!isValidPhone.value) return;
  localStorage.setItem(PHONE_HISTORY_KEY, loginPhone.value);
  smsLoading.value = true; loginMsg.value = "";
  if (!currentAppId.value) currentAppId.value = generateAppId();
  try {
    const r = await fetch(`${LOGIN_API}?action=send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: loginPhone.value, appid: currentAppId.value, resultToken }) });
    const d = await r.json();
    if (d.status === 'success') {
      loginMsg.value = d.msg || '验证码已发送，请查收'; loginMsgKind.value = 'ok';
      startSmsCountdown(); nextTick(() => { codeInputRef.value?.focus(); });
    } else if (d.status === 'need_captcha') {
      loginMsg.value = d.msg || '需要安全验证'; loginMsgKind.value = 'error'; await startCaptcha(d.mobile || '');
    } else {
      loginMsg.value = d.msg || '发送失败'; loginMsgKind.value = 'error';
    }
  } catch (e) { loginMsg.value = '请求发送出错: ' + e.message; loginMsgKind.value = 'error'; }
  finally { smsLoading.value = false; }
}
async function startCaptcha(mobileHex) {
  await loadScript();
  if (typeof window.TencentCaptcha !== 'function') { loginMsg.value = '验证码组件加载失败'; loginMsgKind.value = 'error'; return; }
  const captcha = new window.TencentCaptcha(CAPTCHA_APPID, async function(res) {
    if (res.ret === 0) {
      try {
        loginMsg.value = "正在进行安全验证..."; loginMsgKind.value = "ok";
        const vr = await fetch(`${LOGIN_API}?action=validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: res.ticket, randstr: res.randstr, mobile: mobileHex, phone: loginPhone.value, appid: currentAppId.value }) });
        const vd = await vr.json();
        if (vd.status === 'success' && vd.resultToken) { loginMsg.value = "安全验证通过，正在发送短信..."; await handleSendCode(vd.resultToken); }
        else { loginMsg.value = vd.msg || '安全验证未通过'; loginMsgKind.value = 'error'; }
      } catch (e) { loginMsg.value = '验证校验出错: ' + e.message; loginMsgKind.value = 'error'; }
    } else { loginMsg.value = '已取消安全验证'; loginMsgKind.value = 'error'; }
  });
  captcha.show();
}
async function doLogin() {
  if (!isValidPhone.value || !loginCode.value) return;
  loginLoading.value = true;
  try {
    localStorage.setItem(PHONE_HISTORY_KEY, loginPhone.value);
    const r = await fetch(`${LOGIN_API}?action=login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: loginPhone.value, code: loginCode.value, appid: currentAppId.value || generateAppId() }) });
    const d = await r.json();
    if (d.status !== "success") throw new Error(d.msg || "登录失败");
    if (d.ecs_token) { setEcsToken(d.ecs_token); hideLogin(); fetchData(); }
    else throw new Error("后端返回的数据中缺少 ecs_token");
  } catch (e) { loginMsg.value = e.message; loginMsgKind.value = "error"; }
  finally { loginLoading.value = false; }
}

function showLogin() { loginModal.value = true; currentAppId.value = ""; }
function hideLogin() { loginModal.value = false; }
function switchLoginMode(m) { loginMode.value = m; loginMsg.value = ""; }
function logout() { clearEcsToken(); signedRate.value = "—"; qciLevel.value = "—"; setStatus("已退出", "info"); loginMode.value = "sms"; hasLimitService.value = false; ocsData.value = null; prevOcsData.value = null; showLogin(); }
function applyTokenLogin() { if (loginToken.value.length > 20) { setEcsToken(loginToken.value); hideLogin(); fetchData(); } }
function startTimer() { stopTimer(); timer = setInterval(() => { if (!paused.value) fetchData(); }, INTERVAL_MS); }
function stopTimer() { clearInterval(timer); }
function togglePause() { paused.value = !paused.value; }
async function copyEcsToken() { try { await navigator.clipboard.writeText(getEcsToken()); setStatus("Token复制成功", "ok"); } catch {} }
function resetHistory() { prevOcsData.value = null; lastSessionTime.value = "—"; }

onMounted(() => {
  mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQueryList.addEventListener) { mediaQueryList.addEventListener('change', onSystemThemeChange); }
  else if (mediaQueryList.addListener) { mediaQueryList.addListener(onSystemThemeChange); }
  initTheme();

  if (!window.__FLOW_GROUP_BINDED__) {
    window.__FLOW_GROUP_BINDED__ = true;
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-flow-group-toggle='1']");
      if (btn) {
        const group = btn.closest("[data-flow-wrapper='1']")?.querySelector("[data-flow-group='1']");
        if (group) {
          const c = group.getAttribute("data-collapsed") === "1";
          group.setAttribute("data-collapsed", c ? "0" : "1");
          btn.innerText = c ? "收起" : "展开";
          btn.setAttribute("aria-expanded", c ? "true" : "false");
        }
      }
    });
  }

  if (!getEcsToken()) { setStatus("未登录", "info"); showLogin(); } else { fetchData(); }
  startTimer();
});

onBeforeUnmount(() => {
  stopTimer();
  if (mediaQueryList) {
    if (mediaQueryList.removeEventListener) { mediaQueryList.removeEventListener('change', onSystemThemeChange); }
    else if (mediaQueryList.removeListener) { mediaQueryList.removeListener(onSystemThemeChange); }
  }
});
</script>

<style scoped>
/* ===== Root ===== */
.liubang-root {
  max-width: 480px;
  margin: 0 auto;
  padding: 14px;
  min-height: 100dvh;
  font-family: -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f2f2f7;
}

/* ===== Header Card ===== */
.lb-header-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}

.lb-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 0;
}

.lb-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  user-select: none;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
}

.lb-theme-switcher {
  display: flex;
  gap: 1px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 2px;
  flex-shrink: 0;
}
.lb-theme-btn {
  background: none;
  border: none;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1;
}
.lb-theme-btn.active { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }

/* ===== Tabs ===== */
.lb-tabs {
  display: flex;
  border-bottom: 1px solid #ebebeb;
  margin-top: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.lb-tabs::-webkit-scrollbar { display: none; }
.lb-tab {
  background: none;
  border: none;
  padding: 10px 15px;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.lb-tab.active { color: #16a34a; border-bottom-color: #16a34a; font-weight: 600; }

/* ===== Tab Content ===== */
.lb-tab-content { padding: 16px; }

/* ===== 跳点 ===== */
.lb-jump-stats { display: flex; gap: 20px; margin-bottom: 5px; }
.lb-jump-red { color: #ef4444; font-size: 14px; font-weight: 500; }
.lb-jump-green { color: #16a34a; font-size: 14px; font-weight: 500; }
.lb-uptime { font-size: 12px; color: #999; margin-bottom: 10px; }

.lb-loading-bar { height: 3px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-bottom: 12px; }
.lb-loading-inner { height: 100%; width: 40%; background: #16a34a; border-radius: 999px; animation: lb-slide 1.2s ease-in-out infinite; }
@keyframes lb-slide { 0% { transform: translateX(-150%); } 100% { transform: translateX(400%); } }

.lb-section-divider { font-size: 12px; color: #16a34a; margin: 14px 0 10px; }
.lb-data-row { display: flex; align-items: baseline; margin-bottom: 7px; }
.lb-data-label { font-size: 14px; color: #555; min-width: 85px; flex-shrink: 0; }
.lb-data-green { font-size: 14px; color: #16a34a; font-weight: 500; }
.lb-divider-line { border-top: 1px dashed #e5e7eb; margin: 10px 0; }
.lb-empty-hint { text-align: center; color: #bbb; font-size: 13px; padding: 20px 0; }

.lb-reset-btn {
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.lb-reset-btn:hover { background: #dcfce7; }

/* ===== 详情 ===== */
.lb-detail-section { margin-bottom: 10px; }
.lb-mt { margin-top: 18px; }
.lb-detail-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }
.lb-detail-summary-row { display: flex; gap: 32px; margin-bottom: 18px; }
.lb-detail-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.lb-detail-big-red { font-size: 30px; font-weight: 700; color: #ef4444; }
.lb-detail-big-orange { font-size: 30px; font-weight: 700; color: #f97316; }

.lb-pkg-item { margin-bottom: 16px; }
.lb-pkg-name { font-size: 14px; color: #333; margin-bottom: 6px; font-weight: 500; }
.lb-pkg-bar-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.lb-pkg-bar-bg { flex: 1; height: 8px; background: #f0f0f0; border-radius: 999px; overflow: hidden; }
.lb-pkg-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.lb-bar-normal { background: #16a34a; }
.lb-bar-full { background: #ef4444; }
.lb-bar-pct { font-size: 12px; color: #999; min-width: 54px; text-align: right; flex-shrink: 0; }
.lb-pct-red { color: #ef4444; font-weight: 600; }
.lb-pkg-meta { display: flex; justify-content: space-between; font-size: 12px; color: #999; }
.lb-pkg-used { color: #16a34a; }

/* ===== 分析 ===== */
.lb-analysis-info { background: #f9fafb; border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; border: 1px solid #f0f0f0; }
.lb-info-row { display: flex; align-items: baseline; margin-bottom: 7px; font-size: 14px; }
.lb-info-row:last-child { margin-bottom: 0; }
.lb-info-label { color: #888; min-width: 60px; flex-shrink: 0; }
.lb-info-val { color: #222; font-weight: 500; }
.lb-green { color: #16a34a !important; }
.lb-red { color: #ef4444 !important; }

.lb-analysis-cards { display: grid; grid-template-columns: 1fr; gap: 12px; }
:deep(.lb-ocs-card) {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
:deep(.lb-ocs-grid) { display: grid; grid-template-columns: 1fr; gap: 12px; }
:deep([data-flow-group="1"][data-collapsed="1"] .flow-group-grid > :nth-child(n + 2)) { display: none; }

/* ===== 推送/捐赠 ===== */
.lb-push-hint, .lb-donate-hint { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
.lb-donate-links { display: flex; flex-direction: column; gap: 10px; }
.lb-donate-link {
  display: inline-block;
  padding: 12px 16px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

/* ===== 配置 ===== */
.lb-config-section { margin-bottom: 18px; }
.lb-config-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px; }
.lb-required { color: #ef4444; }
.lb-checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #444; margin-bottom: 7px; cursor: pointer; }
.lb-checkbox { width: 17px; height: 17px; accent-color: #16a34a; }
.lb-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  padding: 9px 12px;
  font-size: 14px;
  color: #222;
  background: #fafafa;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
  font-family: inherit;
}
.lb-input:focus { border-color: #16a34a; background: #fff; }
.lb-textarea { resize: none; }
.lb-number-row { display: flex; align-items: center; gap: 8px; }
.lb-number-input { width: 80px; text-align: center; }
.lb-unit { font-size: 13px; color: #888; flex-shrink: 0; }
.lb-num-btn { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 7px; padding: 6px 11px; font-size: 16px; cursor: pointer; line-height: 1; flex-shrink: 0; }
.lb-num-btn:hover { background: #e5e7eb; }
.lb-modify-btn {
  width: 100%;
  padding: 12px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 4px;
}
.lb-modify-btn:hover { background: #dcfce7; }

/* ===== Action Bar ===== */
.lb-action-bar { display: flex; gap: 10px; margin-top: 12px; }
.lb-action-btn {
  flex: 1;
  padding: 12px 8px;
  border-radius: 11px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.15s, background 0.15s;
  font-family: inherit;
}
.lb-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.lb-btn-refresh { background: #16a34a; color: #fff; }
.lb-btn-refresh:hover:not(:disabled) { background: #15803d; }
.lb-btn-pause { background: #fff; color: #333; border: 1px solid #d1d5db; }
.lb-btn-pause:hover { background: #f5f5f5; }
.lb-btn-logout { background: #fff; color: #ef4444; border: 1px solid #fca5a5; }
.lb-btn-logout:hover { background: #fef2f2; }

.lb-spin {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Login Modal ===== */
.lb-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 70px 14px 14px;
}
.lb-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}
.lb-modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.lb-modal-title { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.lb-modal-subtitle { font-size: 12px; color: #999; margin-top: 3px; }
.lb-modal-icon { font-size: 24px; margin-top: -2px; }

.lb-mode-tabs { display: flex; background: #f3f4f6; border-radius: 9px; padding: 3px; margin-bottom: 14px; }
.lb-mode-tab { flex: 1; background: none; border: none; border-radius: 7px; padding: 8px 4px; font-size: 13px; color: #777; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.lb-mode-tab.active { background: #fff; color: #16a34a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.lb-form-group { margin-bottom: 12px; }
.lb-form-label { font-size: 12px; color: #777; font-weight: 500; margin-bottom: 5px; }
.lb-form-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 10px 12px;
  font-size: 15px;
  color: #1a1a1a;
  background: #fafafa;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
  font-family: inherit;
}
.lb-form-input:focus { border-color: #16a34a; background: #fff; }

.lb-sms-row { display: flex; gap: 8px; }
.lb-sms-row .lb-form-input { flex: 1; min-width: 0; }
.lb-sms-btn {
  flex-shrink: 0;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 9px;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 88px;
  font-family: inherit;
  font-weight: 500;
}
.lb-sms-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.lb-login-btn {
  width: 100%;
  padding: 13px;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 11px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  font-family: inherit;
}
.lb-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.lb-login-btn .lb-spin { border-color: rgba(255,255,255,0.35); border-top-color: #fff; }

.lb-msg { margin-top: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; }
.lb-msg-ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
.lb-msg-err { background: #fef2f2; border: 1px solid #fca5a5; color: #ef4444; }

.lb-privacy-tip { margin-top: 12px; font-size: 11px; color: #aaa; line-height: 1.7; }
.lb-privacy-link { background: none; border: none; color: #16a34a; text-decoration: underline; cursor: pointer; font-size: 11px; padding: 0; font-family: inherit; }

/* ===== Dark Mode ===== */
:global(.dark) .liubang-root { background: #18181b; }
:global(.dark) .lb-header-card { background: #27272a; border-color: #3f3f46; }
:global(.dark) .lb-title { color: #f4f4f5; }
:global(.dark) .lb-theme-switcher { background: #3f3f46; }
:global(.dark) .lb-theme-btn.active { background: #52525b; }
:global(.dark) .lb-tab { color: #71717a; }
:global(.dark) .lb-tab.active { color: #4ade80; border-bottom-color: #4ade80; }
:global(.dark) .lb-tabs { border-bottom-color: #3f3f46; }
:global(.dark) .lb-data-label { color: #a1a1aa; }
:global(.dark) .lb-section-divider { color: #4ade80; }
:global(.dark) .lb-data-green { color: #4ade80; }
:global(.dark) .lb-divider-line { border-color: #3f3f46; }
:global(.dark) .lb-analysis-info { background: #3f3f46; border-color: #52525b; }
:global(.dark) .lb-info-label { color: #a1a1aa; }
:global(.dark) .lb-info-val { color: #f4f4f5; }
:global(.dark) .lb-green { color: #4ade80 !important; }
:global(.dark) .lb-btn-pause { background: #27272a; color: #e4e4e7; border-color: #52525b; }
:global(.dark) .lb-btn-logout { background: #27272a; color: #f87171; border-color: #7f1d1d; }
:global(.dark) .lb-modal { background: #27272a; }
:global(.dark) .lb-modal-title { color: #f4f4f5; }
:global(.dark) .lb-modal-subtitle { color: #71717a; }
:global(.dark) .lb-form-input { background: #3f3f46; border-color: #52525b; color: #f4f4f5; }
:global(.dark) .lb-form-input:focus { border-color: #4ade80; background: #52525b; }
:global(.dark) .lb-mode-tabs { background: #3f3f46; }
:global(.dark) .lb-mode-tab.active { background: #52525b; color: #4ade80; }
:global(.dark) .lb-config-title { color: #e4e4e7; }
:global(.dark) .lb-checkbox-row { color: #d4d4d8; }
:global(.dark) .lb-input { background: #3f3f46; border-color: #52525b; color: #f4f4f5; }
:global(.dark) .lb-input:focus { border-color: #4ade80; }
:global(.dark) .lb-num-btn { background: #52525b; border-color: #71717a; color: #e4e4e7; }
:global(.dark) .lb-pkg-name { color: #e4e4e7; }
:global(.dark) .lb-pkg-bar-bg { background: #3f3f46; }
:global(.dark) .lb-detail-title { color: #f4f4f5; }
:global(.dark) :deep(.lb-ocs-card) { background: #27272a; border-color: #3f3f46; }
:global(.dark) .lb-reset-btn { background: #14532d; border-color: #166534; color: #4ade80; }
:global(.dark) .lb-modify-btn { background: #14532d; border-color: #166534; color: #4ade80; }
:global(.dark) .lb-donate-link { background: #14532d; border-color: #166534; color: #4ade80; }
:global(.dark) .lb-sms-btn { background: #14532d; border-color: #166534; color: #4ade80; }
:global(.dark) .lb-modal-overlay { background: rgba(0,0,0,0.7); }
:global(.dark) .lb-privacy-tip { color: #71717a; }
</style>

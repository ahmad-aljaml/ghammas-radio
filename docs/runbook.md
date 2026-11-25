# دليل التنفيذ خطوة بخطوة (Runbook)

> كل أمر كتبناه، شو بيعمل، وليش. **مش لازم تحفظ الأوامر.** المهم تفهم شو بتعمل كل خطوة وليش، والأوامر موجودة هون ترجعلها أي وقت.

---

## الجزء 1: من جهازي (Windows / PowerShell)

### 1. نقل مفتاح السيرفر لمكان آمن
```powershell
mkdir $HOME\.ssh -Force
move $HOME\Downloads\ghammas-key.pem $HOME\.ssh\
```
**ليش؟** المفتاح هو "مفتاح باب السيرفر". بنحطه بمجلد `.ssh` (المكان المعتاد للمفاتيح)، وبعيد عن مجلد المشروع اللي ممكن ينشارك أو يترفع على GitHub.

### 2. ضبط صلاحيات المفتاح
```powershell
icacls $HOME\.ssh\ghammas-key.pem /inheritance:r
icacls $HOME\.ssh\ghammas-key.pem /grant:r "$($env:USERNAME):(R)"
```
**ليش؟** SSH بيرفض أي مفتاح بيقدر يقرأه حدا غيري (حماية). الأمر الأول بيشيل الصلاحيات الموروثة، والثاني بيعطيني أنا بس صلاحية القراءة.

### 3. الدخول للسيرفر
```powershell
ssh -i $HOME\.ssh\ghammas-key.pem ubuntu@ghammas-radio.duckdns.org
```
**ليش؟** `ssh` = اتصال مشفر بالسيرفر. `-i` = "استخدم هالمفتاح". `ubuntu` = اسم المستخدم الافتراضي على سيرفرات Ubuntu بـ AWS.

---

## الجزء 2: جوا السيرفر (Ubuntu)

### 4. ضبط التوقيت على عمّان
```bash
sudo timedatectl set-timezone Asia/Amman
```
**ليش؟** الجدولة (أي أغاني بأي ساعة) لازم تكون على توقيت المطعم. `sudo` = "نفّذ كمدير".

### 5. تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```
**ليش؟** أول شي بأي سيرفر جديد: تثبيت تحديثات الأمان. `update` = جيب القائمة، و`upgrade` = ثبّت.

### 6. إضافة Swap (رام احتياطية 2GB)
```bash
sudo fallocate -l 2G /swapfile      # احجز ملف 2GB
sudo chmod 600 /swapfile            # root بس بيقدر يقرأه
sudo mkswap /swapfile               # جهزه كـ Swap
sudo swapon /swapfile               # شغّله
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # خليه يشتغل بعد أي إعادة تشغيل
```
**ليش؟** الرام 2GB بس (الحد الأدنى لـ AzuraCast). الـ Swap "رف احتياطي" بيمنع السيرفر يعلق.

### 7. جلسة محمية (tmux)
```bash
tmux new -s install          # افتح جلسة اسمها install
tmux attach -t install       # ارجع للجلسة إذا انقطع الاتصال
```
**ليش؟** التركيب بياخذ دقائق. tmux بيخلي الأوامر تكمل على السيرفر حتى لو انقطع النت.

### 8. تجهيز مجلد AzuraCast
```bash
sudo -i                          # صير root (المدير الأعلى)
mkdir -p /var/azuracast          # أنشئ المجلد الرسمي
cd /var/azuracast                # روح عليه
```
**ليش `/var/azuracast`؟** هذا المكان المعتمد رسمياً. التحديثات والـ Backups والتوثيق كلها بتفترضه.

### 9. تنزيل سكربت التركيب الرسمي وتشغيله
```bash
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh   # نزّل السكربت
chmod a+x docker.sh              # خليه قابل للتشغيل
./docker.sh install              # شغّل التركيب
```
**الأجوبة اللي اخترناها:**
- Switch to **Stable**؟ ← **y**. لأن Stable نسخ مجربة ومستقرة، أنسب للإنتاج من Rolling.
- Update the utility script؟ ← **y**. السكربت لازم يتماشى مع قناة Stable.
- Switch back to Rolling؟ ← **n**.

**ملاحظة (تحدي صغير):** أول مرة السكربت اشتغل من `/root` بدل `/var/azuracast`، لأن `sudo -i` بيرجعك للمجلد الرئيسي. نقلنا الملفات للمكان الصح:
```bash
mv ~/docker.sh ~/.env /var/azuracast/ 2>/dev/null
```
⚠️ **ما بنعيد تشغيل `curl` بعد التحويل لـ Stable**، لأنه بينزل نسخة Rolling من فرع main وبيكتب فوق نسخة Stable.

---

## 🧭 الملخص بجملة وحدة
استأجرنا سيرفر بالسحابة (AWS)، وثبّتنا عنوانه (Elastic IP + DuckDNS)، ودخلناه بمفتاح آمن (SSH)، وجهزناه (توقيت + تحديث + Swap)، وهلأ عم نركّب عليه الإذاعة (AzuraCast).

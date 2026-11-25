# البنية التحتية الفعلية (Infrastructure Inventory)

> سجل بالموارد اللي أنشأناها. ⚠️ ما في أي أسرار هون (لا مفاتيح ولا كلمات سر).

| المورد | القيمة | ملاحظات |
|---|---|---|
| مزود السحابة | AWS (Free Plan) | رصيد 120$ لمدة 182 يوم، وبدون أي خصم من البطاقة |
| المنطقة | eu-north-1 (Stockholm)، Availability Zone: eu-north-1c | |
| السيرفر (EC2) | ghammas-radio, ID: i-093cff7d01fe010b7 | **c7i-flex.large (4GB)**، كان t3.small وكبّرناه بـ 2026-11-23، Ubuntu 24.04 LTS |
| الـ IP الثابت (Elastic IP) | 16.192.19.175 | Allocation: eipalloc-0c6c2eec69e54dd3d |
| الـ IP الداخلي (Private) | 172.31.12.50 | داخل الشبكة الخاصة (VPC) |
| القرص | 30GB gp3, Encrypted (aws/ebs) | Delete on termination = Yes |
| الجدار الناري | Security Group: launch-wizard-1 | 22 / 80 / 443 |
| مفتاح SSH | ghammas-key (RSA) | محفوظ على جهازي بـ ~/.ssh، **مش بمجلد المشروع** |
| الدومين | ghammas-radio.duckdns.org | لازم يأشر على 16.192.19.175 |
| Budget | radio-budget, 30$ شهرياً | تنبيهات عند 85% و100% والتوقع |

## ⚠️ تنظيف بعد انتهاء التقييم
لما يخلص التقييم وما عاد بدنا السيرفر:
1. Terminate للسيرفر (القرص بينحذف معه تلقائياً).
2. **Release** للـ Elastic IP، لأنه إذا ضل محجوز وغير مربوط بيضل ياكل من الرصيد.

## 🔄 خطة النقل لـ Oracle (إذا انحل موضوع الـ MFA)
لأن النظام مبني على Docker (Cloud-Agnostic)، النقل سهل ومش بيحتاج إعادة تصميم:
1. ننشئ سيرفر على Oracle (ARM، 2 OCPU / 12GB) بـ Ubuntu 24.04، ونفتح 22/80/443 بالجدارين (Security List + iptables).
2. نركّب AzuraCast بنفس الأمر.
3. ناخذ **Backup** من AzuraCast على AWS (من لوحة التحكم: Administration > Backups)، ونعمله Restore على Oracle. هيك بتنتقل الأغاني والقوائم والجدولة والإعدادات كلها.
4. نغير الـ IP بـ DuckDNS للـ IP الجديد. **رابط البث ما بيتغير**، وهذه فايدة استخدام دومين بدل IP.
5. بعد ما نتأكد إن كل شي شغال: Terminate لسيرفر AWS، وRelease للـ Elastic IP.

## تجهيز السيرفر (المرحلة 2) ✅ — 2026-11-23
| الخطوة | الأمر | السبب | النتيجة |
|---|---|---|---|
| التوقيت | `timedatectl set-timezone Asia/Amman` | جدولة الأغاني حسب دوام المطعم بعمّان | ✅ +03 |
| تحديث النظام | `apt update && apt upgrade -y` | تثبيت آخر تحديثات الأمان قبل أي شي | ✅ |
| Swap 2GB | `fallocate` + `mkswap` + `swapon` + `/etc/fstab` | الرام 2GB بس (الحد الأدنى لـ AzuraCast)، والـ Swap بيمنع السيرفر يعلق إذا تعبت الرام | ✅ Swap: 2.0Gi |
| الجدار الناري الداخلي | ما احتجنا | على AWS، الـ Security Group لحاله كافي (مش زي Oracle اللي فيه iptables) | — |

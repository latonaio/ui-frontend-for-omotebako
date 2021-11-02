# db 初期化 - redis mysql初期化と、ui-backend-redis(?) の再立ち上げ
bash ../ui-backend-for-omotebako/script/reset-backend-resouces.sh
kubectl delete -f ../ui-backend-for-omotebako-redis/k8s/deployment.yml
kubectl apply -f ../ui-backend-for-omotebako-redis/k8s/deployment.yml

# 何もしていない
#  - Aさん(json[1])
# 予約のみ
#  - Bさん(json[3])
# リピーター　予約のみ
#  - Cさん(json[6])
# 予約、チェックイン
#  - Dさん(json[0])
# 予約、チェックイン、チェックアウト
#  - Eさん(json[4])、Fさん(json[5])

# 予約だけ
make execute-only-reservation target=3 #A san guestId = 1


# 予約＆チェックイン
make execute-login target=0 # B san gId=2

# 予約＆チェックイン＆チェックアウト
make execute-login target=4 # E sann gId=3
make execute-checkout guestId=3

make execute-login target=5 # F sann gId=4
make execute-checkout guestId=4

make execute-login target=6 # C sann gID=5
make execute-checkout guestId=5
make execute-visited-checkin target=6 guestId=5 # A san guestId = 1


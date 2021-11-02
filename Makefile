docker-build:
	echo "build for development"
	bash docker-build.sh

docker-build-production:
	echo "build for production"
	bash docker-build.sh production

docker-push:
	bash docker-build.sh push

.PHONY: docker-build-clean
docker-build-clean: docker-build
	sudo /bin/bash -c "echo 3 > /proc/sys/vm/drop_caches"

.PHONY: docker-push-clean
docker-push-clean: docker-push
	sudo /bin/bash -c "echo 3 > /proc/sys/vm/drop_caches"

.PHONY: docker-build-production-clean
docker-build-production-clean: docker-build-production
	sudo /bin/bash -c "echo 3 > /proc/sys/vm/drop_caches"

# 初めて訪れるお客さん
# targetはcustomerInfo.jsonのindex番号
# 例 make execute-login target=1
execute-login:
	cd scripts/ && node newCheckin.js ${target}

# 例 make execute-checkout guestId=9
execute-checkout:
	cd scripts/ && node checkout.js ${guestId}

# 顧客としてのログイン（一度訪れたことがあるお客さんとして）
# 例 make execute-visited-checkin target=1 guestId=9
execute-visited-checkin:
	cd scripts/ && node visitedCheckin.js ${target} ${guestId}

# 予約だけ実行したいとき
# 例 make execute-only-reservation target=0
execute-only-reservation:
	cd scripts/ && node onlyReservationRegister.js ${target}

